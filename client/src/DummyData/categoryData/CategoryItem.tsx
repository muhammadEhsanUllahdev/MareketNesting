import React from "react";
import * as Icons from "lucide-react";
import { LucideProps } from "lucide-react";
export type IconName = keyof typeof Icons;
interface CategoryItemProps {
  icon: IconName;
  name: string;
  count: string;
}

const CategoryItem = ({ icon, name, count }: CategoryItemProps) => {
  function capitalizeFirst(str: any) {
    str = String(str || "");
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  const iconName = capitalizeFirst(icon) as keyof typeof Icons;
  const IconComponent = Icons[iconName] as React.FC<LucideProps>;
  return (
    <div className="flex items-center justify-between py-1.5 px-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-cebleu-purple-50 group">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-br from-cebleu-purple-50 to-white shadow-sm border border-cebleu-purple-100 group-hover:bg-cebleu-purple-100 group-hover:text-cebleu-purple transition-colors">
          {IconComponent && (
            <IconComponent size={14} className="text-cebleu-purple-600" />
          )}
        </div>
        <span className="text-xs font-medium text-cebleu-purple-800 group-hover:text-cebleu-purple-900">
          {name}
        </span>
      </div>
      <span className="text-[10px] font-medium text-cebleu-purple-400 group-hover:text-cebleu-purple-500">
        {count}
      </span>
    </div>
  );
};

export default CategoryItem;
