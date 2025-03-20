
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { CheckSquare, ChevronDown, Trash2, Circle } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Course = Tables<"courses">;

interface BulkActionBarProps {
  selectedCourses: string[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDeleteSelected: () => void;
  onUpdateStatusSelected: (status: string) => void;
  totalCourses: number;
}

export function BulkActionBar({
  selectedCourses,
  onSelectAll,
  onDeselectAll,
  onDeleteSelected,
  onUpdateStatusSelected,
  totalCourses,
}: BulkActionBarProps) {
  const selectedCount = selectedCourses.length;
  const isAllSelected = selectedCount === totalCourses && totalCourses > 0;

  return (
    <div className="sticky top-0 z-10 py-2 px-4 mb-4 bg-background border rounded-md shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={isAllSelected ? onDeselectAll : onSelectAll}
          className="flex items-center gap-1 text-xs"
        >
          <CheckSquare className="h-4 w-4" />
          {isAllSelected ? "Deselect All" : "Select All"}
        </Button>
        
        <span className="text-sm text-muted-foreground px-2">
          {selectedCount} {selectedCount === 1 ? "course" : "courses"} selected
        </span>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={selectedCount === 0}>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Circle className="h-4 w-4" />
              Update Status <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onUpdateStatusSelected("active")}>
              Set as Active
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateStatusSelected("inactive")}>
              Set as Inactive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="destructive"
          size="sm"
          disabled={selectedCount === 0}
          onClick={onDeleteSelected}
          className="flex items-center gap-1"
        >
          <Trash2 className="h-4 w-4" />
          Delete Selected
        </Button>
      </div>
    </div>
  );
}
