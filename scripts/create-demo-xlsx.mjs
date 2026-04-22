import path from "node:path";
import XLSX from "xlsx";

const outputPath = path.join(process.cwd(), "public", "demo", "catalog-demo.xlsx");

const rows = [
  {
    product_name: "Aura Desk Lamp",
    sku: "AUR-001",
    brand: "Lunet",
    category: "Lighting",
    short_description: "Мінімалістична лампа для робочого столу.",
    description:
      "Тонкий алюмінієвий корпус і м'яке регулювання яскравості для домашнього офісу.",
    price: 3890,
    image_1: "https://picsum.photos/seed/aura-lamp-1/1200/900",
    image_2: "https://picsum.photos/seed/aura-lamp-2/1200/900",
    image_3: "https://picsum.photos/seed/aura-lamp-3/1200/900",
    order: 1,
    attr_color: "Sand",
    attr_material: "Aluminum",
    attr_power: "12W",
    attr_size: "42 x 16 cm",
    attr_warranty: "24 months",
  },
  {
    product_name: "Noma Lounge Chair",
    sku: "NOM-017",
    brand: "Atelier Form",
    category: "Seating",
    short_description: "Комфортне крісло для лаунж-зони.",
    description:
      "Текстурована оббивка, глибока посадка та легкий дерев'яний каркас для сучасних інтер'єрів.",
    price: 12990,
    image_1: "https://picsum.photos/seed/noma-chair-1/1200/900",
    image_2: "https://picsum.photos/seed/noma-chair-2/1200/900",
    image_3: "https://picsum.photos/seed/noma-chair-3/1200/900",
    order: 2,
    attr_color: "Olive",
    attr_material: "Boucle + Oak",
    attr_power: "",
    attr_size: "78 x 71 x 74 cm",
    attr_warranty: "36 months",
  },
  {
    product_name: "Frame Shelf Set",
    sku: "FRM-210",
    brand: "North Module",
    category: "Storage",
    short_description: "Комплект настінних полиць у скандинавському стилі.",
    description:
      "Добре підходить для декору, книг і невеликих предметів у вітальні чи шоурумі.",
    price: 5490,
    image_1: "https://picsum.photos/seed/frame-shelf-1/1200/900",
    image_2: "https://picsum.photos/seed/frame-shelf-2/1200/900",
    image_3: "https://picsum.photos/seed/frame-shelf-3/1200/900",
    order: 3,
    attr_color: "Walnut",
    attr_material: "Wood veneer",
    attr_power: "",
    attr_size: "Set of 3",
    attr_warranty: "18 months",
  },
  {
    product_name: "Miro Coffee Table",
    sku: "MIR-808",
    brand: "Studio Miro",
    category: "Tables",
    short_description: "Журнальний столик із виразною округлою стільницею.",
    description:
      "Матова поверхня, компактні пропорції та зручний формат для сучасної зони очікування.",
    price: 8490,
    image_1: "https://picsum.photos/seed/miro-table-1/1200/900",
    image_2: "https://picsum.photos/seed/miro-table-2/1200/900",
    image_3: "https://picsum.photos/seed/miro-table-3/1200/900",
    order: 4,
    attr_color: "Terracotta",
    attr_material: "Composite stone",
    attr_power: "",
    attr_size: "90 x 90 x 34 cm",
    attr_warranty: "24 months",
  },
  {
    product_name: "Flux Floor Mirror",
    sku: "FLX-404",
    brand: "Verre House",
    category: "Decor",
    short_description: "Підлогове дзеркало для спальні або бутіка.",
    description:
      "Тонка металева рама та нейтральна геометрія допомагають інтегрувати дзеркало в різні стилі інтер'єру.",
    price: 7190,
    image_1: "https://picsum.photos/seed/flux-mirror-1/1200/900",
    image_2: "https://picsum.photos/seed/flux-mirror-2/1200/900",
    image_3: "https://picsum.photos/seed/flux-mirror-3/1200/900",
    order: 5,
    attr_color: "Black",
    attr_material: "Powder-coated steel",
    attr_power: "",
    attr_size: "180 x 70 cm",
    attr_warranty: "24 months",
  },
];

const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.json_to_sheet(rows);

XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
XLSX.writeFile(workbook, outputPath);

console.log(`Demo XLSX created at ${outputPath}`);
