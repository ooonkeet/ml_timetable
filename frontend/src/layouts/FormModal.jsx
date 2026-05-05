import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,  
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function FormModal({
  open,
  onClose,
  title,
  fields = [],  
  defaultValues = {},
  onSubmit,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues });

  const handleClose = () => {
    reset();
    onClose();
  };

  const submitHandler = (data) => {
    onSubmit(data);
    
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Fill the form below and save your changes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name} className="flex flex-col">
              <label className="mb-1 text-sm font-medium">{field.label}</label>

              {field.type === "number" && (
                <Input
                  type="number"
                  {...register(field.name, { required: `${field.label} is required` })}
                />
              )}

              {field.type === "text" && (
                <Input
                  type="text"
                  {...register(field.name, { required: `${field.label} is required` })}
                />
              )}

              {field.type === "select" && (
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  {...register(field.name, { required: `${field.label} is required` })}
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}

              {field.type === "time" && (
                <Input
                  type="time"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                  {...register(field.name, { required: `${field.label} is required` })}
                />
              )}

              {field.type === "checkboxGroup" && (
                <div className="grid grid-cols-3 gap-2">
                  {field.options?.map((opt) => (
                    <label key={opt.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        {...register(field.name + '.' + opt.value)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              )}

              {errors[field.name] && (
                <span className="text-red-500 text-xs">{errors[field.name].message}</span>
              )}
            </div>
          ))}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}