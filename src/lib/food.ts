import type { food_item } from './types';

export const foodItems: food_item[] = [
  {
    id: '1',
    slug: 'spaghetti-carbonara',
    title: 'Classic Spaghetti Carbonara',
    description: 'A creamy and delicious Italian pasta dish made with eggs, cheese, pancetta, and pepper.',
    imageUrl: 'https://picsum.photos/600/400',
    imageHint: 'pasta carbonara',
    cuisine: 'Italian',
    dietary: [],
    price: 60.00,
  },
  {
    id: '2',
    slug: 'avocado-toast',
    title: 'Simple Avocado Toast',
    description: 'A quick, healthy, and satisfying breakfast or snack. Perfectly ripe avocado on toasted artisan bread.',
    imageUrl: 'https://picsum.photos/600/400',
    imageHint: 'avocado toast',
    cuisine: 'Modern',
    dietary: ['Vegetarian', 'Vegan'],
    price: 35.00,
  },
  {
    id: '3',
    slug: 'chicken-curry',
    title: 'Easy Chicken Curry',
    description: 'A flavorful and aromatic chicken curry that comes together in under an hour. Perfect for a weeknight dinner.',
    imageUrl: 'https://picsum.photos/600/400',
    imageHint: 'chicken curry',
    cuisine: 'Indian',
    dietary: ['Gluten-Free'],
    price: 45.00,
  },
  {
    id: '4',
    slug: 'assorted-jollof',
    title: 'Assorted Jollof',
    description: 'Enjoy a well-prepared plate of jollof rice, made fresh with a blend of vegetables, chicken, sausage, gizzard and beef. This chef-made dish comes with a side of shito and coleslaw for a balanced and flavorful meal. Simple, satisfying and delicious.',
    imageUrl: 'https://picsum.photos/800/600',
    imageHint: 'jollof rice',
    cuisine: 'Ghanaian',
    dietary: [],
    price: 90.00,
  }
];
