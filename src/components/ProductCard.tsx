import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  name: string;
  image: string;
  price: number;
  tag?: string;
  outOfStock?: boolean;
}

const ProductCard = ({ name, image, price, tag, outOfStock }: ProductCardProps) => {
  const tagClass = outOfStock
    ? "bg-destructive text-destructive-foreground"
    : tag?.startsWith("Only")
    ? "bg-amber-500 text-white"
    : "bg-secondary text-secondary-foreground";

  const content = (
    <div className={`overflow-hidden rounded-lg bg-card border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${outOfStock ? "opacity-75" : ""}`}>
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img src={image} alt={name} className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 ${outOfStock ? "grayscale" : ""}`} />
        {tag && (
          <span className={`absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-bold shadow-md ${tagClass}`}>
            {tag}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-heading text-sm">{name}</h3>
        <p className="mt-1 font-body text-muted-foreground">From ₹{price}</p>
        <Button
          className="mt-3 w-full bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md transition-all duration-200 disabled:opacity-60"
          size="sm"
          disabled={outOfStock}
        >
          {outOfStock ? "Out of Stock" : "View Product"}
        </Button>
      </div>
    </div>
  );

  if (outOfStock) {
    return <div className="group block cursor-not-allowed">{content}</div>;
  }
  return (
    <Link to="/product" className="group block">
      {content}
    </Link>
  );
};

export default ProductCard;
