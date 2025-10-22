import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Students() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    studentId: "",
    name: "",
    email: "",
    phone: "",
    major: "",
    year: "",
  });

  // Redirect if not admin
  if (user?.role !== 'admin') {
    setLocation("/");
    return null;
  }

  const utils = trpc.useUtils();
  const { data: students, isLoading } = trpc.students.list.useQuery();

  const createMutation = trpc.students.create.useMutation({
    onSuccess: () => {
      utils.students.list.invalidate();
      toast.success("Thêm sinh viên thành công!");
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Có lỗi xảy ra khi thêm sinh viên");
    },
  });

  const deleteMutation = trpc.students.delete.useMutation({
    onSuccess: () => {
      utils.students.list.invalidate();
      toast.success("Xóa sinh viên thành công!");
    },
    onError: (error) => {
      toast.error(error.message || "Có lỗi xảy ra khi xóa sinh viên");
    },
  });

  const resetForm = () => {
    setFormData({
      studentId: "",
      name: "",
      email: "",
      phone: "",
      major: "",
      year: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.studentId || !formData.name) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    createMutation.mutate({
      studentId: formData.studentId,
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      major: formData.major || undefined,
      year: formData.year ? parseInt(formData.year) : undefined,
      qrCode: formData.studentId, // Use student ID as QR code
    });
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa sinh viên "${name}"?`)) {
      deleteMutation.mutate({ id });
    }
  };

  const filteredStudents = students?.filter((student) => {
    const query = searchQuery.toLowerCase();
    return (
      student.name.toLowerCase().includes(query) ||
      student.studentId.toLowerCase().includes(query) ||
      student.email?.toLowerCase().includes(query) ||
      student.major?.toLowerCase().includes(query)
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Sinh viên</h1>
            <p className="text-gray-600 mt-2">
              Thêm, chỉnh sửa và quản lý danh sách sinh viên tham gia sự kiện
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Thêm Sinh viên
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Thêm Sinh viên mới</DialogTitle>
                  <DialogDescription>
                    Nhập thông tin sinh viên để thêm vào hệ thống
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="studentId">
                      Mã sinh viên <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="studentId"
                      value={formData.studentId}
                      onChange={(e) =>
                        setFormData({ ...formData, studentId: e.target.value })
                      }
                      placeholder="VD: SV001"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">
                      Họ và tên <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="VD: Nguyễn Văn A"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="VD: student@university.edu"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="VD: 0123456789"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="major">Ngành học</Label>
                    <Input
                      id="major"
                      value={formData.major}
                      onChange={(e) =>
                        setFormData({ ...formData, major: e.target.value })
                      }
                      placeholder="VD: Công nghệ thông tin"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="year">Năm học</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) =>
                        setFormData({ ...formData, year: e.target.value })
                      }
                      placeholder="VD: 2"
                      min="1"
                      max="6"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Đang thêm..." : "Thêm"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Tìm kiếm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo tên, mã sinh viên, email hoặc ngành học..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách Sinh viên</CardTitle>
            <CardDescription>
              Tổng số: {filteredStudents?.length || 0} sinh viên
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                Đang tải dữ liệu...
              </div>
            ) : filteredStudents && filteredStudents.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã SV</TableHead>
                      <TableHead>Họ và tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Số điện thoại</TableHead>
                      <TableHead>Ngành học</TableHead>
                      <TableHead>Năm</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.studentId}
                        </TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.email || "-"}</TableCell>
                        <TableCell>{student.phone || "-"}</TableCell>
                        <TableCell>{student.major || "-"}</TableCell>
                        <TableCell>{student.year || "-"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(student.id, student.name)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchQuery
                    ? "Không tìm thấy sinh viên nào"
                    : "Chưa có sinh viên nào. Thêm sinh viên đầu tiên!"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function Users(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

