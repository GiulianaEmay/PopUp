// Catálogo estático de Pop Up — editable directamente aquí
// Para agregar/quitar productos, modifica este archivo y haz deploy de nuevo.

const products = [
  // --- Vestidos ---
  {
    id: "v-001",
    name: "Vestido Midi Rosa Empolvado",
    description:
      "Vestido midi en tono rosa empolvado con silueta fluida, perfecto para ocasiones especiales. Tela liviana y caída elegante.",
    price: 189.0,
    category: "vestidos",
    sizes: ["XS", "S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1653286431693-2bbde8b10e14?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwd29tZW4lMjBkcmVzcyUyMHBhc3RlbHxlbnwwfHx8fDE3NzcwNTE2OTJ8MA&ixlib=rb-4.1.0&q=85",
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=900&q=85",
    ],
    stock: 15,
    featured: true,
    is_new: true,
  },
  {
    id: "v-002",
    name: "Vestido Floral Bloom",
    description:
      "Vestido de inspiración romántica con estampado floral delicado. Mangas abullonadas y cintura entallada.",
    price: 159.0,
    category: "vestidos",
    sizes: ["S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=900&q=85",
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=900&q=85",
    ],
    stock: 12,
    featured: true,
    is_new: false,
  },
  {
    id: "v-003",
    name: "Vestido Slip Satinado",
    description:
      "Vestido slip en satén con tirantes finos. Elegante, minimalista y versátil.",
    price: 215.0,
    category: "vestidos",
    sizes: ["XS", "S", "M"],
    images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900&q=85"],
    stock: 8,
    featured: false,
    is_new: true,
  },
  // --- Blusas ---
  {
    id: "b-001",
    name: "Blusa Pastel Drape",
    description:
      "Blusa en rosa pastel con drapeado frontal suave. Tejido fluido y acabado prolijo.",
    price: 119.0,
    category: "blusas",
    sizes: ["XS", "S", "M", "L"],
    images: [
      "https://static.prod-images.emergentagent.com/jobs/0b23cfd5-8cc1-479c-83ea-8b020088f0be/images/e567ae3faca490a10a29e55330f17000c495275f5aaf1289445a7f2d34b22f67.png",
    ],
    stock: 20,
    featured: true,
    is_new: false,
  },
  {
    id: "b-002",
    name: "Top Knit Suave",
    description:
      "Top de punto fino color crema. Cómodo, elástico y fácil de combinar.",
    price: 89.0,
    category: "blusas",
    sizes: ["S", "M", "L"],
    images: ["https://images.unsplash.com/photo-1564257577-2d3d1c56adf2?w=900&q=85"],
    stock: 25,
    featured: false,
    is_new: false,
  },
  {
    id: "b-003",
    name: "Camisa Oversized Blanca",
    description:
      "Camisa oversized en algodón blanco puro. Corte relajado, ideal para estilismos casuales o formales.",
    price: 139.0,
    category: "blusas",
    sizes: ["XS", "S", "M", "L", "XL"],
    images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=900&q=85"],
    stock: 18,
    featured: false,
    is_new: true,
  },
  // --- Faldas ---
  {
    id: "f-001",
    name: "Falda Midi Rose Plissé",
    description:
      "Falda midi plisada en tono rosa. Cinturilla elástica y vuelo fluido al caminar.",
    price: 149.0,
    category: "faldas",
    sizes: ["S", "M", "L"],
    images: [
      "https://static.prod-images.emergentagent.com/jobs/0b23cfd5-8cc1-479c-83ea-8b020088f0be/images/ebbe02c69cdea875ef6b1acd5aeed509c783df10684487cda2658e09147fc21f.png",
    ],
    stock: 14,
    featured: true,
    is_new: false,
  },
  {
    id: "f-002",
    name: "Falda Mini A-Line",
    description: "Falda mini corte A en tono beige. Combinable con cualquier top.",
    price: 99.0,
    category: "faldas",
    sizes: ["XS", "S", "M"],
    images: ["https://images.unsplash.com/photo-1583496661160-fb5886a13d44?w=900&q=85"],
    stock: 16,
    featured: false,
    is_new: false,
  },
  // --- Pantalones ---
  {
    id: "p-001",
    name: "Pantalón Wide Leg Crema",
    description:
      "Pantalón de pierna ancha en tono crema. Caída elegante y cintura alta.",
    price: 179.0,
    category: "pantalones",
    sizes: ["XS", "S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1496865534669-25ec2a3a0fd3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTJ8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGZhc2hpb24lMjBtb2RlbCUyMHBhc3RlbCUyMG1pbmltYWx8ZW58MHx8fHwxNzc3MDUxNjkyfDA&ixlib=rb-4.1.0&q=85",
    ],
    stock: 22,
    featured: true,
    is_new: false,
  },
  {
    id: "p-002",
    name: "Jean Mom Fit",
    description: "Jean mom fit en denim suave. Tiro alto y calce cómodo.",
    price: 169.0,
    category: "pantalones",
    sizes: ["S", "M", "L"],
    images: ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=900&q=85"],
    stock: 19,
    featured: false,
    is_new: true,
  },
  // --- Conjuntos ---
  {
    id: "c-001",
    name: "Conjunto Blazer Pastel",
    description:
      "Conjunto de blazer y pantalón en rosa pastel. Elegante, moderno y femenino.",
    price: 329.0,
    category: "conjuntos",
    sizes: ["S", "M", "L"],
    images: [
      "https://images.pexels.com/photos/7691223/pexels-photo-7691223.jpeg",
      "https://images.pexels.com/photos/7872805/pexels-photo-7872805.jpeg",
    ],
    stock: 10,
    featured: true,
    is_new: true,
  },
  {
    id: "c-002",
    name: "Conjunto Knit Loungewear",
    description:
      "Conjunto de punto en dos piezas. Top y pantalón cómodos para looks relajados.",
    price: 219.0,
    category: "conjuntos",
    sizes: ["XS", "S", "M", "L"],
    images: ["https://images.unsplash.com/photo-1603252109303-2751441dd157?w=900&q=85"],
    stock: 13,
    featured: false,
    is_new: false,
  },
];

export default products;
