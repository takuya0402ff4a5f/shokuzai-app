import { useState, useMemo } from 'react'
import { useIngredients } from './hooks/useIngredients'
import { useSettings } from './hooks/useSettings'
import { useCustomRecipes } from './hooks/useCustomRecipes'
import { useRecipeFavorites } from './hooks/useRecipeFavorites'
import { useShoppingList } from './hooks/useShoppingList'
import { useWeeklyPlan } from './hooks/useWeeklyPlan'
import { useCustomAliases } from './hooks/useCustomAliases'
import { useAlertSettings } from './hooks/useAlertSettings'
import { getExpiryStatus } from './utils/expiry'
import { INGREDIENTS_DB } from './data/ingredientsDb'
import IngredientCard from './components/IngredientCard'
import IngredientForm from './components/IngredientForm'
import UseModal from './components/UseModal'
import RecipeScreen from './components/RecipeScreen'
import RecipeModal from './components/RecipeModal'
import RecipeForm from './components/RecipeForm'
import SettingsScreen from './components/SettingsScreen'
import ShoppingScreen from './components/ShoppingScreen'
import WeeklyPlanScreen from './components/WeeklyPlanScreen'

const FOOD_CATEGORIES = ['すべて', '野菜・きのこ', '豆腐・大豆', '肉', '魚介', '卵・乳製品', '乾物・主食', '果物', '冷凍', 'その他']
const CONDIMENT_PRIORITY = ['砂糖', '塩', '酢', '醤油', 'みそ']

export default function App() {
  const { settings, updateSetting } = useSettings()
  const { ingredients, addIngredient, updateIngredient, deleteIngredient, consumeIngredient, bulkConsumeIngredients } = useIngredients(settings.autoDeleteZero ?? false)
  const { customRecipes, addCustomRecipe, updateCustomRecipe, deleteCustomRecipe } = useCustomRecipes()
  const { favorites, toggleFavorite } = useRecipeFavorites()
  const { items: shoppingItems, addItem: addShoppingItem, toggleItem: toggleShoppingItem, removeItem: removeShoppingItem, clearChecked: clearCheckedShopping } = useShoppingList()
  const { plan, addMeal, removeMealItem, clearMeal, clearAll: clearWeeklyPlan } = useWeeklyPlan()
  const { aliases, addAlias, removeAlias, updateAliasPriority } = useCustomAliases()
  const { alerts, addAlert, updateThreshold, removeAlert } = useAlertSettings()
  const [activeScreen, setActiveScreen] = useState('ingredients') // 'ingredients' | 'recipes' | 'settings'
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [prefillIngredient, setPrefillIngredient] = useState(null)
  const [useTarget, setUseTarget] = useState(null)
  const [recipeTarget, setRecipeTarget] = useState(null)
  const [showRecipeForm, setShowRecipeForm] = useState(false)
  const [editRecipeTarget, setEditRecipeTarget] = useState(null)
  const [activeCategory, setActiveCategory] = useState('すべて')
  const [activeStatus, setActiveStatus] = useState('すべて')
  const [activeSection, setActiveSection] = useState('food') // 'food' | 'condiment'

  const expiredCount = useMemo(
    () => ingredients.filter(i => getExpiryStatus(i.expiryDate) === 'expired').length,
    [ingredients]
  )
  const warningCount = useMemo(
    () => ingredients.filter(i => getExpiryStatus(i.expiryDate) === 'warning').length,
    [ingredients]
  )

  function handleSectionChange(section) {
    setActiveSection(section)
    setActiveCategory('すべて')
    setActiveStatus('すべて')
  }

  const filtered = useMemo(() => {
    const list = ingredients.filter(item => {
      if (activeSection === 'food' && item.category === '調味料') return false
      if (activeSection === 'condiment' && item.category !== '調味料') return false
      if (activeSection === 'food') {
        if (activeCategory !== 'すべて' && item.category !== activeCategory) return false
        if (activeStatus === '余裕あり' && !['ok', 'none'].includes(getExpiryStatus(item.expiryDate))) return false
        if (activeStatus === '期限近い' && getExpiryStatus(item.expiryDate) !== 'warning') return false
        if (activeStatus === '期限切れ' && getExpiryStatus(item.expiryDate) !== 'expired') return false
      }
      return true
    })
    if (activeSection === 'condiment' && settings.condimentSort !== false) {
      return [...list].sort((a, b) => {
        const ai = CONDIMENT_PRIORITY.indexOf(a.name)
        const bi = CONDIMENT_PRIORITY.indexOf(b.name)
        if (ai !== -1 && bi !== -1) return ai - bi
        if (ai !== -1) return -1
        if (bi !== -1) return 1
        return a.name.localeCompare(b.name, 'ja')
      })
    }
    return list
  }, [ingredients, activeCategory, activeStatus, activeSection])

  function handleAdd(form) {
    addIngredient(form)
    setShowForm(false)
  }

  function handleEdit(ingredient) {
    setEditTarget(ingredient)
    setShowForm(true)
  }

  function handleUpdate(form) {
    updateIngredient(editTarget.id, form)
    setShowForm(false)
    setEditTarget(null)
  }

  function handleCancel() {
    setShowForm(false)
    setEditTarget(null)
    setPrefillIngredient(null)
  }

  // レシピモーダルから「未登録食材を登録する」ボタン
  function handleQuickAddIngredient(name) {
    const dbItem = INGREDIENTS_DB.find(i => i.name === name)
    setPrefillIngredient({
      name,
      category: dbItem?.category ?? 'その他',
      totalUnit: dbItem?.totalUnit ?? '個',
      totalAmount: dbItem?.defaultAmount ?? 1,
      refAmount: dbItem?.refAmount ?? '',
      refUnit: dbItem?.refUnit ?? 'g',
      expiryDate: '',
      remainingPercent: 100,
    })
    setEditTarget(null)
    setShowForm(true)
  }

  function handleCook(recipeIngredients, multiplier) {
    bulkConsumeIngredients(recipeIngredients, multiplier, aliases, settings.pairPriorities)
  }

  function handlePurchaseShopping(name, amount, unit) {
    const dbItem = INGREDIENTS_DB.find(i => i.name === name)
    addIngredient({
      name,
      category: dbItem?.category ?? 'その他',
      totalAmount: amount,
      totalUnit: unit ?? dbItem?.totalUnit ?? '個',
      expiryDate: '',
      refAmount: dbItem?.refAmount ?? '',
      refUnit: dbItem?.refUnit ?? 'g',
      remainingPercent: 100,
    })
  }

  function handleAddFromRecipe(items, multiplier) {
    for (const item of items) {
      const dbItem = INGREDIENTS_DB.find(i => i.name === item.name)
      addIngredient({
        name: item.name,
        category: dbItem?.category ?? 'その他',
        totalAmount: Math.round(item.amount * multiplier * 10) / 10,
        totalUnit: dbItem?.totalUnit ?? item.unit,
        expiryDate: '',
        refAmount: dbItem?.refAmount ?? '',
        refUnit: dbItem?.refUnit ?? 'g',
        remainingPercent: 100,
      })
    }
  }

  const HEADER_TITLES = {
    ingredients: { title: '食材管理',    sub: null },
    recipes:     { title: '料理する',    sub: 'レシピを選んで材料を一括消込' },
    shopping:    { title: '買い物リスト', sub: null },
    weekly:      { title: '週間献立',    sub: null },
    settings:    { title: '設定',        sub: null },
  }
  const header = HEADER_TITLES[activeScreen]

  return (
    <div className="max-w-md mx-auto min-h-svh flex flex-col bg-gray-50">

      {/* 共通ヘッダー */}
      <header className="bg-[#f39800] text-white px-4 pt-10 pb-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{header.title}</h1>
            {activeScreen === 'ingredients' && (
              <p className="text-[#fff8ed] text-xs mt-0.5">
                {ingredients.length}件登録中
                {expiredCount > 0 && (
                  <span className="ml-2 bg-[#e30f25] text-white text-xs px-1.5 py-0.5 rounded-full">
                    期限切れ {expiredCount}件
                  </span>
                )}
                {warningCount > 0 && (
                  <span className="ml-2 bg-yellow-400 text-yellow-900 text-xs px-1.5 py-0.5 rounded-full">
                    期限近い {warningCount}件
                  </span>
                )}
              </p>
            )}
            {header.sub && (
              <p className="text-[#fff8ed] text-xs mt-0.5">{header.sub}</p>
            )}
          </div>
          {activeScreen === 'ingredients' && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-white text-[#f39800] font-bold text-2xl w-10 h-10 rounded-full shadow flex items-center justify-center hover:bg-[#fff8ed] transition-colors"
              aria-label="食材を追加"
            >
              +
            </button>
          )}
          {activeScreen === 'recipes' && (
            <button
              onClick={() => { setEditRecipeTarget(null); setShowRecipeForm(true) }}
              className="bg-white text-[#f39800] font-bold text-2xl w-10 h-10 rounded-full shadow flex items-center justify-center hover:bg-[#fff8ed] transition-colors"
              aria-label="レシピを追加"
            >
              +
            </button>
          )}
        </div>
      </header>

      {/* 食材画面コンテンツ */}
      {activeScreen === 'ingredients' && (
        <>
          <div className="bg-white border-b border-gray-200 flex flex-col">
            {/* セクションタブ */}
            <div className="flex border-b border-gray-200">
              {[
                { key: 'food',      label: '食材' },
                { key: 'condiment', label: '調味料' },
              ].map(s => (
                <button
                  key={s.key}
                  onClick={() => handleSectionChange(s.key)}
                  className={`flex-1 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                    activeSection === s.key
                      ? 'border-[#f39800] text-[#f39800]'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            {/* 食材セクションのみフィルター表示 */}
            {activeSection === 'food' && (
              <>
                <div className="flex border-b border-gray-200">
                  {[
                    { key: 'すべて',   label: 'すべて' },
                    { key: '余裕あり', label: '余裕あり' },
                    { key: '期限近い', label: '期限近い' },
                    { key: '期限切れ', label: '期限切れ' },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveStatus(tab.key)}
                      className={`flex-1 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                        activeStatus === tab.key
                          ? 'border-[#f39800] text-[#f39800]'
                          : 'border-transparent text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 px-4 pb-3 pt-2">
                  {FOOD_CATEGORIES.map(c => (
                    <button
                      key={c}
                      onClick={() => setActiveCategory(c)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        activeCategory === c
                          ? 'bg-[#fef0d4] text-[#c97f00] border-[#f39800]'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-[#f8c875]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <main className="flex-1 px-4 py-4 pb-24">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                  <p className="font-medium">{activeSection === 'condiment' ? '調味料がありません' : '食材がありません'}</p>
                <p className="text-sm mt-1">右上の + から追加してください</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {filtered.map(item => (
                  <IngredientCard
                    key={item.id}
                    ingredient={item}
                    onDelete={deleteIngredient}
                    onEdit={handleEdit}
                    onUse={setUseTarget}
                    onAddToShopping={addShoppingItem}
                  />
                ))}
              </div>
            )}
          </main>
        </>
      )}

      {/* レシピ画面コンテンツ */}
      {activeScreen === 'recipes' && (
        <div className="flex flex-col flex-1 pb-20">
          <RecipeScreen
            ingredients={ingredients}
            onSelectRecipe={setRecipeTarget}
            customRecipes={customRecipes}
            onDeleteCustomRecipe={deleteCustomRecipe}
            onEditCustomRecipe={recipe => { setEditRecipeTarget(recipe); setShowRecipeForm(true) }}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onAddToShopping={addShoppingItem}
            onCreateRecipe={name => { setEditRecipeTarget({ name }); setShowRecipeForm(true) }}
            aliases={aliases}
            pairPriorities={settings.pairPriorities}
          />
        </div>
      )}

      {/* 買い物リスト画面 */}
      {activeScreen === 'shopping' && (
        <ShoppingScreen
          ingredients={ingredients}
          items={shoppingItems}
          alertSettings={alerts}
          onAdd={addShoppingItem}
          onToggle={toggleShoppingItem}
          onRemove={removeShoppingItem}
          onClearChecked={clearCheckedShopping}
          onPurchase={handlePurchaseShopping}
        />
      )}

      {/* 週間献立画面 */}
      {activeScreen === 'weekly' && (
        <WeeklyPlanScreen
          plan={plan}
          ingredients={ingredients}
          customRecipes={customRecipes}
          onAddMeal={addMeal}
          onRemoveMealItem={removeMealItem}
          onClearMeal={clearMeal}
          onClearAll={clearWeeklyPlan}
          onAddToShopping={addShoppingItem}
          onSelectRecipe={setRecipeTarget}
          weekStartsOnSunday={settings.weekStartsOnSunday ?? false}
        />
      )}

      {/* 設定画面コンテンツ */}
      {activeScreen === 'settings' && (
        <SettingsScreen
          settings={settings}
          onUpdate={updateSetting}
          aliases={aliases}
          onAddAlias={addAlias}
          onRemoveAlias={removeAlias}
          onUpdateAliasPriority={updateAliasPriority}
          pairPriorities={settings.pairPriorities}
          onUpdatePairPriority={(name, prio) => updateSetting('pairPriorities', { ...settings.pairPriorities, [name]: prio })}
          alerts={alerts}
          onAddAlert={addAlert}
          onUpdateAlertThreshold={updateThreshold}
          onRemoveAlert={removeAlert}
          ingredients={ingredients}
        />
      )}

      {/* ボトムナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 flex z-20">
        {[
          { key: 'ingredients', label: '食材' },
          { key: 'recipes',     label: '料理する' },
          { key: 'shopping',    label: '買い物' },
          { key: 'weekly',      label: '献立' },
          { key: 'settings',    label: '設定' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveScreen(tab.key)}
            className={`flex-1 flex flex-col items-center justify-center py-3 text-xs transition-colors border-t-2 ${
              activeScreen === tab.key
                ? 'text-[#f39800] border-[#f39800] font-bold'
                : 'text-gray-400 border-transparent hover:text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* 食材追加・編集モーダル */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-20 flex items-end" onClick={handleCancel}>
          <div className="bg-white w-full max-w-md mx-auto rounded-t-2xl p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editTarget ? '食材を編集' : '食材を追加'}
            </h2>
            <IngredientForm
              onSubmit={editTarget ? handleUpdate : handleAdd}
              onCancel={handleCancel}
              initial={editTarget ?? prefillIngredient}
            />
          </div>
        </div>
      )}

      {/* 使うモーダル */}
      {useTarget && (
        <UseModal
          ingredient={useTarget}
          onUse={consumeIngredient}
          onClose={() => setUseTarget(null)}
        />
      )}

      {/* 料理するモーダル */}
      {recipeTarget && (
        <RecipeModal
          recipe={recipeTarget}
          ingredients={ingredients}
          onCook={handleCook}
          onClose={() => setRecipeTarget(null)}
          onAddIngredients={handleAddFromRecipe}
          onAddToShopping={addShoppingItem}
          onQuickAddIngredient={handleQuickAddIngredient}
          aliases={aliases}
          pairPriorities={settings.pairPriorities}
        />
      )}

      {/* カスタムレシピ作成・編集モーダル */}
      {showRecipeForm && (
        <div className="fixed inset-0 bg-black/50 z-20 flex items-end" onClick={() => { setShowRecipeForm(false); setEditRecipeTarget(null) }}>
          <div className="bg-white w-full max-w-md mx-auto rounded-t-2xl p-6 max-h-[90svh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editRecipeTarget ? 'レシピを編集' : 'レシピを作成'}
            </h2>
            <RecipeForm
              initial={editRecipeTarget}
              ingredients={ingredients}
              onSubmit={recipe => {
                if (editRecipeTarget?.id) {
                  updateCustomRecipe(editRecipeTarget.id, recipe)
                } else {
                  addCustomRecipe(recipe)
                }
                setShowRecipeForm(false)
                setEditRecipeTarget(null)
              }}
              onCancel={() => { setShowRecipeForm(false); setEditRecipeTarget(null) }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
