import {
  Utensils,
  IceCreamBowlIcon as Bowl,
  ChefHat,
  Fish,
  Carrot,
  Apple,
  Beef,
  Pizza,
  Sandwich,
  Soup,
  Shell,
  Salad,
  Drumstick,
  Banana,
  HandPlatterIcon as Plate,
} from "lucide-react"

export function FoodIcon() {
  // Create an array of food-related icons
  const icons = [
    Utensils,
    Bowl,
    ChefHat,
    Fish,
    Carrot,
    Apple,
    Beef,
    Pizza,
    Sandwich,
    Soup,
    Shell,
    Salad,
    Drumstick,
    Banana,
    Plate,
  ]

  // Generate random positions for the icons
  const iconElements = []

  for (let i = 0; i < 100; i++) {
    const IconComponent = icons[Math.floor(Math.random() * icons.length)]
    const top = `${Math.random() * 100}%`
    const left = `${Math.random() * 100}%`
    const opacity = 0.2 + Math.random() * 0.3
    const size = 16 + Math.floor(Math.random() * 10)

    iconElements.push(
      <div key={i} className="absolute text-gray-700" style={{ top, left, opacity }}>
        <IconComponent size={size} />
      </div>,
    )
  }

  // Add text elements that appear in the design
  const textElements = [
    { text: "Tasty", top: "15%", left: "10%" },
    { text: "Feel Good", top: "20%", right: "10%" },
    { text: "Tasty", top: "40%", right: "10%" },
    { text: "Feel Good", top: "70%", left: "10%" },
    { text: "Tasty", top: "80%", left: "40%" },
  ]

  const renderedTextElements = textElements.map((el, index) => (
    <div
      key={`text-${index}`}
      className="absolute font-bold text-gray-700 opacity-40"
      style={{
        top: el.top,
        left: el.left,
        right: el.right,
      }}
    >
      {el.text}
    </div>
  ))

  return (
    <div className="w-full h-full relative">
      {iconElements}
      {renderedTextElements}
    </div>
  )
}

// This component is no longer needed since we're using the background image
// We'll keep it as a backup but it won't be used in the main app

