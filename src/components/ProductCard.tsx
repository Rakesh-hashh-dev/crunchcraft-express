import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  name: string;
  image: string;
  price: number;
  tag?: string;
}

const ProductCard = ({ name, image, price, tag }: ProductCardProps) => (
  <Link to="/product" className="group block">
    <div className="overflow-hidden rounded-lg bg-card border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img src={image} alt={name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
        {tag && (
          <span className="absolute top-3 left-3 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground shadow-md">
            {tag}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-heading text-sm">{name}</h3>
        <p className="mt-1 font-body text-muted-foreground">From ₹{price}</p>
        <Button className="mt-3 w-full bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md transition-all duration-200" size="sm">
          View Product
        </Button>
      </div>
    </div>
  </Link>
);

export default ProductCard;
