export const menu = [
  { id:"espresso", name:"Эспрессо", category:"coffee", price:150, description:"Насыщенный кофейный напиток небольшого объёма.", taste:"Крепкий, интенсивный, с кофейной горчинкой.", ingredients:"Кофе, вода", tags:["крепкий","классический"], image:"/images/espresso.jpg" },
  { id:"americano", name:"Американо", category:"coffee", price:190, description:"Эспрессо, разбавленный горячей водой.", taste:"Мягкий, сбалансированный, с лёгкой горчинкой.", ingredients:"Эспрессо, горячая вода", tags:["мягкий","классический"], image:"/images/americano.jpg" },
  { id:"cappuccino", name:"Капучино", category:"coffee", price:220, description:"Эспрессо с горячим молоком и нежной молочной пеной.", taste:"Сбалансированный кофейный вкус с молочной сладостью.", ingredients:"Эспрессо, молоко", tags:["молочный","популярный"], image:"/images/cappuccino.jpg" },
  { id:"latte", name:"Латте", category:"coffee", price:240, description:"Нежный кофейный напиток с большой долей горячего молока.", taste:"Мягкий, сливочный, с деликатным вкусом кофе.", ingredients:"Эспрессо, молоко", tags:["молочный","мягкий"], image:"/images/latte.jpg" },
  { id:"flat-white", name:"Флэт уайт", category:"coffee", price:250, description:"Двойной эспрессо с небольшим количеством молока.", taste:"Выраженный кофейный вкус и бархатистая текстура.", ingredients:"Двойной эспрессо, молоко", tags:["крепкий","молочный"], image:"/images/flat_white.jpg" },
  { id:"raf", name:"Раф", category:"coffee", price:260, description:"Кофейный напиток, приготовленный со сливками.", taste:"Сладкий, сливочный, с нежной кофейной ноткой.", ingredients:"Эспрессо, сливки, ванильный сахар", tags:["сладкий","сливочный"], image:"/images/vanilla_cream.jpg" },
  { id:"mocha", name:"Мокка", category:"coffee", price:270, description:"Кофейный напиток с шоколадом и молоком.", taste:"Шоколадный, сладкий, с кофейной основой.", ingredients:"Эспрессо, молоко, шоколад", tags:["шоколадный","сладкий"], image:"/images/mocha.jpg" },
  { id:"macchiato", name:"Эспрессо макиато", category:"coffee", price:180, description:"Классический эспрессо с небольшим количеством молочной пены.", taste:"Крепкий кофейный вкус с лёгким молочным оттенком.", ingredients:"Эспрессо, молочная пена", tags:["крепкий","классический"], image:"/images/espresso_macchiato.jpg" },
  { id:"cortado", name:"Кортадо", category:"coffee", price:210, description:"Небольшой напиток из эспрессо и тёплого молока.", taste:"Насыщенный, но мягче чистого эспрессо.", ingredients:"Эспрессо, молоко", tags:["крепкий","молочный"], image:"/images/cortado.jpg" },
  { id:"iced-latte", name:"Айс латте", category:"coffee", price:260, description:"Холодный кофейный напиток с молоком и льдом.", taste:"Мягкий, сливочный, освежающий.", ingredients:"Эспрессо, холодное молоко, лёд", tags:["холодный","молочный"], image:"/images/iced_latte.jpg" },

  { id:"black-tea", name:"Чёрный чай", category:"tea", price:180, description:"Классический чай с насыщенным настоем.", taste:"Бодрящий, терпкий, с насыщенным ароматом.", ingredients:"Чёрный чай, вода", tags:["классический","без молока"], image:"/images/black_tea.jpg" },
  { id:"green-tea", name:"Зелёный чай", category:"tea", price:180, description:"Лёгкий чай с нежным ароматом и свежим вкусом.", taste:"Травянистый, свежий, слегка терпкий.", ingredients:"Зелёный чай, вода", tags:["лёгкий","без молока"], image:"/images/green_tea.jpg" },
  { id:"jasmine-tea", name:"Жасминовый чай", category:"tea", price:200, description:"Ароматный чай с нежными цветочными нотами жасмина.", taste:"Цветочный, лёгкий, деликатный.", ingredients:"Чай с жасмином, вода", tags:["цветочный","ароматный"], image:"/images/jasmine_tea.jpg" },
  { id:"earl-grey", name:"Эрл Грей", category:"tea", price:200, description:"Чёрный чай с ароматом бергамота.", taste:"Насыщенный, цитрусовый, слегка терпкий.", ingredients:"Чёрный чай, бергамот, вода", tags:["цитрусовый","ароматный"], image:"/images/earl_grey_tea.jpg" },
  { id:"chamomile-tea", name:"Ромашковый чай", category:"tea", price:190, description:"Мягкий травяной настой с цветочным ароматом.", taste:"Нежный, цветочный, без выраженной терпкости.", ingredients:"Ромашка, вода", tags:["травяной","без кофеина"], image:"/images/chamomile_tea.jpg" },
  { id:"berry-tea", name:"Ягодный чай", category:"tea", price:220, description:"Фруктово-ягодный напиток с ярким ароматом.", taste:"Ягодный, фруктовый, с приятной кислинкой.", ingredients:"Ягодная смесь, вода", tags:["ягодный","фруктовый"], image:"/images/berry_tea.jpg" },
  { id:"ginger-lemon-tea", name:"Имбирно-лимонный чай", category:"tea", price:220, description:"Согревающий напиток с имбирём и лимоном.", taste:"Пряный, цитрусовый, с лёгкой остротой имбиря.", ingredients:"Имбирь, лимон, вода", tags:["пряный","цитрусовый"], image:"/images/ginger_lemon_tea.jpg" },

  { id:"cheesecake", name:"Чизкейк", category:"dessert", price:290, description:"Нежный десерт на основе сливочного сыра с песочной основой.", taste:"Сливочный, нежный, умеренно сладкий.", ingredients:"Сливочный сыр, песочная основа, сахар", tags:["сливочный","нежный"], image:"/images/classic_cheesecake.jpg" },
  { id:"tiramisu", name:"Тирамису", category:"dessert", price:310, description:"Итальянский десерт с кофейными нотами и нежным кремом.", taste:"Кофейный, сливочный, с лёгкой горчинкой какао.", ingredients:"Савоярди, крем, кофе, какао", tags:["кофейный","сливочный"], image:"/images/tiramisu.jpg" },
  { id:"brownie", name:"Брауни", category:"dessert", price:240, description:"Плотный шоколадный десерт с насыщенным вкусом какао.", taste:"Шоколадный, насыщенный, сладкий.", ingredients:"Шоколад, какао, мука, сахар, масло", tags:["шоколадный","плотный"], image:"/images/brownie.jpg" },
  { id:"croissant", name:"Круассан", category:"dessert", price:190, description:"Воздушная выпечка из слоёного теста.", taste:"Сливочный, нежный, с хрустящей корочкой.", ingredients:"Слоёное тесто, сливочное масло", tags:["выпечка","нежный"], image:"/images/croissant.jpg" },
  { id:"fondant", name:"Шоколадный фондан", category:"dessert", price:320, description:"Шоколадный десерт с нежной серединой.", taste:"Интенсивный шоколадный вкус, сладкий и насыщенный.", ingredients:"Шоколад, яйца, мука, сахар, масло", tags:["шоколадный","насыщенный"], image:"/images/lava.jpg" },
  { id:"carrot-cake", name:"Морковный торт", category:"dessert", price:280, description:"Мягкий пряный бисквит с морковью и нежным кремом.", taste:"Сладкий, пряный, с ореховыми нотами.", ingredients:"Морковь, мука, специи, крем", tags:["пряный","нежный"], image:"/images/carrot_cake.jpg" },

  { id:"matcha-latte", name:"Матча латте", category:"other", price:270, description:"Напиток на основе японского зелёного чая матча и молока.", taste:"Травянистый, сливочный, с лёгкой терпкостью.", ingredients:"Матча, молоко", tags:["чайный","молочный"], image:"/images/matcha_latte.jpg" },
  { id:"hot-chocolate", name:"Горячий шоколад", category:"other", price:250, description:"Густой горячий напиток с насыщенным шоколадным вкусом.", taste:"Сладкий, шоколадный, сливочный.", ingredients:"Шоколад, молоко", tags:["шоколадный","сладкий"], image:"/images/hot_chocolate.jpg" },
  { id:"lemonade", name:"Домашний лимонад", category:"other", price:220, description:"Освежающий напиток с цитрусовым вкусом.", taste:"Кисло-сладкий, свежий, цитрусовый.", ingredients:"Лимон, вода, сахар", tags:["холодный","цитрусовый"], image:"/images/homemade_lemnade.jpg" },
  { id:"berry-mors", name:"Ягодный морс", category:"other", price:210, description:"Прохладный ягодный напиток с фруктовым вкусом.", taste:"Ягодный, освежающий, с лёгкой кислинкой.", ingredients:"Ягоды, вода, сахар", tags:["ягодный","холодный"], image:"/images/berry_juice.jpg" }
];

export const menuCategories = [
  { id:"all", label:"Всё меню" },
  { id:"coffee", label:"Кофе" },
  { id:"tea", label:"Чай" },
  { id:"dessert", label:"Десерты" },
  { id:"other", label:"Другие напитки" }
];

export const categoryLabels = {
  coffee:"Кофе", tea:"Чай", dessert:"Десерты", other:"Другие напитки"
};

export function getMenuItem(id) {
  return menu.find(item => item.id === id);
}