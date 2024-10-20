import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronsUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_DOMAIN } from "@/config";
import { useAuth } from "@/context/AuthContext";
import { allPermissions } from "@/config";

export function AddUserModal({ onUserAdded }: { onUserAdded: () => void }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [role, setRole] = useState("Staff");
  const [password, setPassword] = useState("");
  const [permissions, setPermissions] = useState<string[]>(["CanReadUser"]);
  const [isOpen, setIsOpen] = useState(false);
  const [openPermissions, setOpenPermissions] = useState(false);
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  useEffect(() => {
    if (role === "Admin") {
      setPermissions(allPermissions);
    } else {
      setPermissions(["CanReadUser"]);
    }
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasPermission("CanCreateUser")) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to create new users.",
        variant: "destructive",
      });
      return;
    }

    const newUser = {
      name,
      username,
      email,
      phone,
      website,
      role,
      password,
      permissions,
    };

    try {
      const response = await fetch(`${API_DOMAIN}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        toast({
          title: "User added",
          description: "The new user has been successfully added.",
        });
        onUserAdded();
        setIsOpen(false);
        resetForm();
      } else {
        throw new Error("Failed to add user");
      }
    } catch (error) {
      console.error("Error adding user:", error);
      toast({
        title: "Error",
        description: "Failed to add user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setName("");
    setUsername("");
    setEmail("");
    setPhone("");
    setWebsite("");
    setRole("Staff");
    setPassword("");
    setPermissions(["CanReadUser"]);
  };

  if (!hasPermission("CanCreateUser")) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Add New User</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Add a new user to the system.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="website" className="text-right">
                Website
              </Label>
              <Input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Role</SelectLabel>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Staff">Staff</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="permissions" className="text-right">
                Permissions
              </Label>
              <Popover open={openPermissions} onOpenChange={setOpenPermissions}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openPermissions}
                    className="w-[200px] justify-between"
                  >
                    {permissions.length > 0
                      ? `${permissions.length} selected`
                      : "Select permissions"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <div className="max-h-[200px] overflow-y-auto">
                    {allPermissions.map((item) => (
                      <div
                        key={item}
                        className="flex items-center space-x-2 p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setPermissions((prev) =>
                            prev.includes(item)
                              ? prev.filter((i) => i !== item)
                              : [...prev, item]
                          );
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={permissions.includes(item)}
                          onChange={() => {}}
                          className="h-4 w-4"
                        />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add User</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
