export const CATEGORIES = [
  {
    id: 'food',
    name: 'Food & Dining',
    icon: 'restaurant',
    iconFamily: 'MaterialIcons',
    color: '#FF6B6B',
    lightColor: '#FFE5E5',
    darkColor: '#3D1515',
  },
  {
    id: 'transport',
    name: 'Transport',
    icon: 'directions-car',
    iconFamily: 'MaterialIcons',
    color: '#4ECDC4',
    lightColor: '#E0F8F7',
    darkColor: '#0D3332',
  },
  {
    id: 'bills',
    name: 'Bills & Utilities',
    icon: 'receipt-long',
    iconFamily: 'MaterialIcons',
    color: '#FFE66D',
    lightColor: '#FFFBE0',
    darkColor: '#3D3410',
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: 'shopping-bag',
    iconFamily: 'MaterialIcons',
    color: '#A29BFE',
    lightColor: '#EDECFF',
    darkColor: '#1E1A3D',
  },
  {
    id: 'health',
    name: 'Health & Medical',
    icon: 'favorite',
    iconFamily: 'MaterialIcons',
    color: '#FF7675',
    lightColor: '#FFE8E8',
    darkColor: '#3D1A1A',
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: 'movie',
    iconFamily: 'MaterialIcons',
    color: '#FD79A8',
    lightColor: '#FFE5F2',
    darkColor: '#3D1228',
  },
  {
    id: 'education',
    name: 'Education',
    icon: 'school',
    iconFamily: 'MaterialIcons',
    color: '#74B9FF',
    lightColor: '#E3F2FF',
    darkColor: '#0D2540',
  },
  {
    id: 'travel',
    name: 'Travel',
    icon: 'flight',
    iconFamily: 'MaterialIcons',
    color: '#55EFC4',
    lightColor: '#DCFDF5',
    darkColor: '#0D3D30',
  },
  {
    id: 'personal',
    name: 'Personal Care',
    icon: 'spa',
    iconFamily: 'MaterialIcons',
    color: '#FDCB6E',
    lightColor: '#FFF6E0',
    darkColor: '#3D3010',
  },
  {
    id: 'other',
    name: 'Other',
    icon: 'more-horiz',
    iconFamily: 'MaterialIcons',
    color: '#B2BEC3',
    lightColor: '#F0F3F4',
    darkColor: '#1E2527',
  },
];

export const getCategoryById = (id) => {
  return CATEGORIES.find((cat) => cat.id === id) || CATEGORIES[CATEGORIES.length - 1];
};

export const getCategoryColor = (id) => {
  const cat = getCategoryById(id);
  return cat.color;
};