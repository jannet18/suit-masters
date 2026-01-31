interface CategroryNavProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

const CategoryNav: React.FC<CategroryNavProps> = ({
  selectedCategory,
  setSelectedCategory,
}) => {
  const categories = [
    "Plaid suits",
    "Slim Fit",
    "Single Breasted",
    "Three Piece Suits",
    "Double Vent",
    "Velvet Suits",
  ];

  return (
    <div className="bg-white border-t border-b border-gray-200 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center overflow-x-auto py-6 -mx-4 px-4 scrollbar-hide">
          {categories.map((category, index) => (
            <button
              key={index}
              className={`whitespace-nowrap px-4 py-2 rounded-lg mr-4 transition-colors duration-300 ${
                selectedCategory === category
                  ? "bg-slate-500 text-white hover:bg-slate-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryNav;
