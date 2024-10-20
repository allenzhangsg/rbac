import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { allPermissions, API_DOMAIN } from "@/config";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AddUserModal } from "./AddUserModal";
import { useAuth } from "@/context/AuthContext";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  role: string;
  permissions: string[];
}

export function UserList() {
  const { hasPermission } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof User>("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { toast } = useToast();
  const [openPermissions, setOpenPermissions] = useState(false);

  useEffect(() => {
    if (hasPermission("CanReadUser")) {
      fetchUsers();
    }
  }, [hasPermission]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_DOMAIN}/api/v1/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const filteredUsers = users.filter((user) =>
    Object.values(user).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (a[sortColumn] < b[sortColumn]) return sortDirection === "asc" ? -1 : 1;
    if (a[sortColumn] > b[sortColumn]) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleSort = (column: keyof User) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleEditClick = (user: User) => {
    if (hasPermission("CanUpdateUser")) {
      setEditingUser({
        ...user,
        permissions: user.permissions || [] // Ensure permissions is always an array
      });
      setIsEditModalOpen(true);
    } else {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to edit users.",
        variant: "destructive",
      });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const response = await fetch(
        `${API_DOMAIN}/api/v1/users?id=${editingUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(editingUser),
        }
      );

      if (response.ok) {
        setUsers(users.map((u) => (u.id === editingUser.id ? editingUser : u)));
        setIsEditModalOpen(false);
        toast({
          title: "User updated",
          description: "The user has been successfully updated.",
        });
      } else {
        throw new Error("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingUser) {
      setEditingUser({
        ...editingUser,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleRoleChange = (value: string) => {
    if (editingUser) {
      setEditingUser({
        ...editingUser,
        role: value,
        permissions: value === "Admin" ? allPermissions : ["CanReadUser"],
      });
    }
  };

  const handlePermissionChange = (permission: string) => {
    if (editingUser) {
      const currentPermissions = editingUser.permissions || [];
      setEditingUser({
        ...editingUser,
        permissions: currentPermissions.includes(permission)
          ? currentPermissions.filter((p) => p !== permission)
          : [...currentPermissions, permission],
      });
    }
  };

  const handleDeleteClick = (user: User) => {
    if (hasPermission("CanDeleteUser")) {
      setUserToDelete(user);
    } else {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to delete users.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(
        `${API_DOMAIN}/api/v1/users?id=${userToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setUsers(users.filter((u) => u.id !== userToDelete.id));
        toast({
          title: "User deleted",
          description: "The user has been successfully deleted.",
        });
      } else {
        throw new Error("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUserToDelete(null);
    }
  };

  const handleUserAdded = () => {
    // Refresh the user list
    fetchUsers();
  };

  if (!hasPermission("CanReadUser")) {
    return (
      <div style={{ color: "red" }}>
        You don&apos;t have permission to view the user list.
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4 gap-4">
        <Input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <AddUserModal onUserAdded={handleUserAdded} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            {[
              "id",
              "name",
              "username",
              "email",
              "phone",
              "website",
              "role",
              "permissions",
            ].map((column) => (
              <TableHead
                key={column}
                onClick={() => handleSort(column as keyof User)}
                className="text-left"
              >
                <Button
                  variant="ghost"
                  className="font-bold p-0 hover:bg-transparent"
                >
                  {column.charAt(0).toUpperCase() + column.slice(1)}
                  {sortColumn === column ? (
                    sortDirection === "asc" ? (
                      <ChevronUp className="ml-2 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-2 h-4 w-4" />
                    )
                  ) : (
                    <ChevronsUpDown className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </TableHead>
            ))}
            <TableHead className="font-bold text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phone}</TableCell>
              <TableCell>{user.website}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>{user.permissions.join(", ")}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost">Actions</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {hasPermission("CanUpdateUser") && (
                      <DropdownMenuItem onSelect={() => handleEditClick(user)}>
                        Edit
                      </DropdownMenuItem>
                    )}
                    {hasPermission("CanDeleteUser") && (
                      <DropdownMenuItem
                        onSelect={() => handleDeleteClick(user)}
                      >
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 flex justify-between items-center">
        <div>
          Showing {indexOfFirstItem + 1} to{" "}
          {Math.min(indexOfLastItem, sortedUsers.length)} of{" "}
          {sortedUsers.length} entries
        </div>
        <div>
          {Array.from(
            { length: Math.ceil(sortedUsers.length / itemsPerPage) },
            (_, i) => (
              <Button
                key={i}
                onClick={() => paginate(i + 1)}
                variant={currentPage === i + 1 ? "default" : "outline"}
                className="mx-1"
              >
                {i + 1}
              </Button>
            )
          )}
        </div>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            {editingUser && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={editingUser.name}
                    onChange={handleInputChange}
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
                    name="username"
                    value={editingUser.username}
                    onChange={handleInputChange}
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
                    name="email"
                    type="email"
                    value={editingUser.email}
                    onChange={handleInputChange}
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
                    name="phone"
                    type="tel"
                    value={editingUser.phone}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="website" className="text-right">
                    Website
                  </Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    value={editingUser.website}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Role
                  </Label>
                  <Select
                    value={editingUser.role}
                    onValueChange={handleRoleChange}
                  >
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
                  <Popover
                    open={openPermissions}
                    onOpenChange={setOpenPermissions}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openPermissions}
                        className="w-[200px] justify-between"
                      >
                        {editingUser?.permissions?.length > 0
                          ? `${editingUser.permissions.length} selected`
                          : "Select permissions"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search permissions..." />
                        <CommandEmpty>No permission found.</CommandEmpty>
                        <CommandGroup>
                          {allPermissions.map((item) => (
                            <CommandItem
                              key={item}
                              onSelect={() => handlePermissionChange(item)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  editingUser?.permissions?.includes(item)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {item}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!userToDelete}
        onOpenChange={() => setUserToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this user?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
