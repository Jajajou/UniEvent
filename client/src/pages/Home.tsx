import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Store, Users, QrCode, Activity } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const { data: booths } = trpc.booths.list.useQuery();
  const { data: students } = trpc.students.list.useQuery(undefined, {
    enabled: isAdmin,
  });
  const { data: myBooths } = trpc.booths.myBooths.useQuery();

  const totalBooths = booths?.length || 0;
  const totalStudents = students?.length || 0;
  const myBoothsCount = myBooths?.length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Chào mừng, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            {isAdmin
              ? "Quản lý sự kiện và theo dõi hoạt động của các booth"
              : "Quản lý booth của bạn và quét mã QR sinh viên"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isAdmin && (
            <>
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Tổng số Booth
                  </CardTitle>
                  <Store className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {totalBooths}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Booth đang hoạt động
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Tổng số Sinh viên
                  </CardTitle>
                  <Users className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {totalStudents}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Sinh viên đã đăng ký
                  </p>
                </CardContent>
              </Card>
            </>
          )}

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {isAdmin ? "Hoạt động" : "Booth của tôi"}
              </CardTitle>
              {isAdmin ? (
                <Activity className="h-5 w-5 text-purple-500" />
              ) : (
                <Store className="h-5 w-5 text-purple-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {isAdmin ? totalBooths : myBoothsCount}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {isAdmin ? "Booth đang hoạt động" : "Booth được gán"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-indigo-600" />
                Quét mã QR
              </CardTitle>
              <CardDescription>
                Quét mã QR của sinh viên để ghi nhận tham dự booth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" size="lg">
                <Link href="/scanner">
                  <a className="flex items-center justify-center gap-2">
                    <QrCode className="h-5 w-5" />
                    Mở máy quét QR
                  </a>
                </Link>
              </Button>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  Quản lý Sinh viên
                </CardTitle>
                <CardDescription>
                  Thêm, chỉnh sửa và quản lý danh sách sinh viên
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full" size="lg">
                  <Link href="/students">
                    <a className="flex items-center justify-center gap-2">
                      <Users className="h-5 w-5" />
                      Quản lý Sinh viên
                    </a>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* My Booths (for non-admin users) */}
        {!isAdmin && myBooths && myBooths.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Booth của tôi</CardTitle>
              <CardDescription>
                Danh sách các booth bạn đang quản lý
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {myBooths.map((booth) => (
                  <div
                    key={booth.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {booth.name}
                      </h3>
                      {booth.location && (
                        <p className="text-sm text-gray-500 mt-1">
                          📍 {booth.location}
                        </p>
                      )}
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/scanner">
                        <a>Quét QR</a>
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

