import { MenuItem } from '../types/customer';

/** Canonical menu catalogue for Thoogudeepa donne biryani mane - consumed by TanStack Query */
export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'item-1',
    name: 'Special Chicken Donne Biryani',
    price: 260,
    category: 'Rice & Bowls',
    isVeg: false,
    badge: 'Bestseller',
    description:
      'Fragrant Seeraga Samba short-grain rice cooked with succulent chicken, fresh mint, coriander, native green masala, served hot in authentic leaf donne.',
    imagePlaceholder: 'CHICKEN DONNE BIRYANI',
    prepMode: 'Military Dum Handi',
    optionsGroup1: {
      title: 'Spice Level',
      choices: ['Medium Spicy (Traditional)', 'Extra Hot Guntur Chilli'],
    },
    optionsGroup2: {
      title: 'Add-Ons',
      addOns: [
        { name: 'Extra Boiled Egg (1 Pc)', extraPrice: 20 },
        { name: 'Kushka Rice Portion', extraPrice: 90 },
      ],
    },
  },
  {
    id: 'item-2',
    name: 'Thoogudeepa Mutton Donne Biryani',
    price: 340,
    category: 'Rice & Bowls',
    isVeg: false,
    badge: 'Chef Special',
    description:
      'Tender country mutton slow-cooked with military hotel spices, fragrant jeera samba rice and rich bone gravy, served in leaf donne with raita and salan.',
    imagePlaceholder: 'MUTTON DONNE BIRYANI',
    prepMode: 'Slow Dum Deg',
    optionsGroup1: {
      title: 'Preparation Choice',
      choices: ['Boneless Cuts', 'Traditional Bone-In Cut'],
    },
    optionsGroup2: {
      title: 'Add-Ons',
      addOns: [
        { name: 'Extra Pepper Gravy Bowl', extraPrice: 35 },
        { name: 'Boiled Egg (2 Pcs)', extraPrice: 35 },
      ],
    },
  },
  {
    id: 'item-3',
    name: 'Kshatriya Chicken Kebab (Crispy)',
    price: 220,
    category: 'Starters',
    isVeg: false,
    badge: 'Popular',
    description:
      'Crisp deep-fried boneless chicken marinated in curd, crushed red chillies, ginger-garlic paste and fresh curry leaves.',
    imagePlaceholder: 'CHICKEN KEBAB',
    prepMode: 'Kadhai Deep Fry',
    optionsGroup1: {
      title: 'Portion Size',
      choices: ['Regular (8 Pcs)', 'Family Platter (14 Pcs)'],
    },
    optionsGroup2: {
      title: 'Add-Ons',
      addOns: [
        { name: 'Extra Onion Rings & Lemon', extraPrice: 15 },
        { name: 'Green Mint Chutney', extraPrice: 20 },
      ],
    },
  },
  {
    id: 'item-4',
    name: 'Paneer Donne Biryani',
    price: 240,
    category: 'Rice & Bowls',
    isVeg: true,
    description:
      'Fresh cottage cheese cubes marinated in green herbal paste and blended with fragrant seeraga samba rice cooked to perfection.',
    imagePlaceholder: 'PANEER DONNE BIRYANI',
    prepMode: 'Dum Pukht Handi',
    optionsGroup1: {
      title: 'Spice Level',
      choices: ['Mild Spiced', 'Authentic Green Chilli Hot'],
    },
    optionsGroup2: {
      title: 'Add-Ons',
      addOns: [
        { name: 'Extra Onion Cucumber Raita', extraPrice: 30 },
        { name: 'Spiced Salan Bowl', extraPrice: 35 },
      ],
    },
  },
  {
    id: 'item-5',
    name: 'Gunpowder Pepper Chicken Dry',
    price: 250,
    category: 'Starters',
    isVeg: false,
    description:
      'Tender chicken pieces tossed with crushed Tellicherry black peppercorns, roasted fennel and caramelized shallots.',
    imagePlaceholder: 'PEPPER CHICKEN',
    prepMode: 'Tawa Roasted Fry',
    optionsGroup1: {
      title: 'Toss Style',
      choices: ['Dry Crisp Toss', 'Semi-Gravy Masala'],
    },
    optionsGroup2: {
      title: 'Add-Ons',
      addOns: [{ name: 'Extra Roasted Garlic Flakes', extraPrice: 25 }],
    },
  },
  {
    id: 'item-6',
    name: 'Nati Koli Saaru (Country Chicken Curry)',
    price: 270,
    category: 'Mains',
    isVeg: false,
    badge: 'Traditional',
    description:
      'Rustic Karnataka village-style chicken curry infused with roasted coriander, dry red chillies, and coconut masala.',
    imagePlaceholder: 'NATI KOLI SAARU',
    prepMode: 'Clay Pot Simmer',
    optionsGroup1: {
      title: 'Gravy Consistency',
      choices: ['Medium Traditional', 'Thick Masala'],
    },
    optionsGroup2: {
      title: 'Add-Ons',
      addOns: [{ name: 'Extra Salna Bowl', extraPrice: 30 }],
    },
  },
  {
    id: 'item-7',
    name: 'Ceylon Coin Parotta (2 Pcs)',
    price: 50,
    category: 'Breads',
    isVeg: true,
    badge: 'Fresh & Hot',
    description:
      'Multi-layered flaky Malabar-style coin parottas roasted on hot tawa with pure ghee, served warm.',
    imagePlaceholder: 'COIN PAROTTA',
    prepMode: 'Tawa Ghee Roast',
    optionsGroup1: {
      title: 'Preparation',
      choices: ['Classic Ghee Roast', 'Crisp Oil Toss'],
    },
    optionsGroup2: {
      title: 'Add-Ons',
      addOns: [{ name: 'Extra Coin Parotta (1 Pc)', extraPrice: 25 }],
    },
  },
  {
    id: 'item-8',
    name: 'Elaneer Payasam (Tender Coconut)',
    price: 110,
    category: 'Desserts',
    isVeg: true,
    badge: 'Signature',
    description:
      'Chilled silky dessert made from fresh tender coconut malai, coconut milk, and fragrant green cardamom.',
    imagePlaceholder: 'ELANEER PAYASAM',
    prepMode: 'Chilled Confection',
    optionsGroup1: {
      title: 'Serving Style',
      choices: ['Chilled Fresh', 'With Crushed Cashews'],
    },
    optionsGroup2: {
      title: 'Add-Ons',
      addOns: [{ name: 'Extra Tender Coconut Malai', extraPrice: 40 }],
    },
  },
  {
    id: 'item-9',
    name: 'Spiced Neer Majjige (Buttermilk)',
    price: 40,
    category: 'Desserts',
    isVeg: true,
    badge: 'Cooler',
    description:
      'Refreshing churned buttermilk tempered with mustard seeds, fresh ginger, green chillies, and crushed curry leaves.',
    imagePlaceholder: 'NEER MAJJIGE',
    prepMode: 'Fresh Cold Churn',
    optionsGroup1: {
      title: 'Spice',
      choices: ['Traditional Mild Spiced', 'Extra Ginger Hit'],
    },
    optionsGroup2: {
      title: 'Add-Ons',
      addOns: [{ name: 'With Boondi Garnish', extraPrice: 10 }],
    },
  },
];
