import Link from 'next/link';

export default function Breadcrumb({ items }) {
  return (
    <nav className="flex items-center space-x-2 text-xl font-semibold text-gray-400">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <span className="mx-2 text-gray-600">›</span>}
          {item.href ? (
            <Link 
              href={item.href}
              className="flex items-center hover:text-white transition-colors"
            >
              {item.label}
              {item.icon && <span className="mr-1">{item.icon}</span>}
            </Link>
          ) : (
            <span className="flex items-center text-white">
              {item.label&& <span className="mr-1">{item.label}</span>}
              {item.icon}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}