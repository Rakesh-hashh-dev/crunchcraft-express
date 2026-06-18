import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { Crumb } from "@/lib/breadcrumbs";

interface BreadcrumbsProps {
  items: Crumb[];
  className?: string;
}

const Breadcrumbs = ({ items, className }: BreadcrumbsProps) => {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {items.map((c, i) => {
          const isLast = i === items.length - 1;
          return (
            <BreadcrumbItem key={`${c.path}-${i}`}>
              {isLast ? (
                <BreadcrumbPage className="font-body">{c.name}</BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbLink asChild>
                    <Link to={c.path} className="font-body hover:text-primary">
                      {c.name}
                    </Link>
                  </BreadcrumbLink>
                  <BreadcrumbSeparator />
                </>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default Breadcrumbs;
