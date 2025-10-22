import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Download, Printer } from "lucide-react";
import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export default function QRGenerator() {
  const { user } = useAuth();
  const { data: students, isLoading } = trpc.students.list.useQuery(undefined, {
    enabled: user?.role === 'admin',
  });

  const canvasRefs = useRef<{ [key: number]: HTMLCanvasElement | null }>({});

  useEffect(() => {
    if (students) {
      students.forEach((student) => {
        const canvas = canvasRefs.current[student.id];
        if (canvas) {
          QRCode.toCanvas(canvas, student.qrCode, {
            width: 200,
            margin: 2,
          });
        }
      });
    }
  }, [students]);

  const handleDownload = (studentId: number, studentName: string, qrCode: string) => {
    const canvas = canvasRefs.current[studentId];
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `QR_${qrCode}_${studentName}.png`;
      link.href = url;
      link.click();
    }
  };

  const handlePrintAll = () => {
    window.print();
  };

  if (user?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Chỉ Admin mới có quyền truy cập trang này.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tạo mã QR</h1>
            <p className="text-gray-600 mt-2">
              Tạo và tải xuống mã QR cho sinh viên
            </p>
          </div>
          <Button onClick={handlePrintAll} size="lg">
            <Printer className="h-5 w-5 mr-2" />
            In tất cả
          </Button>
        </div>

        {/* QR Codes Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Đang tải...</div>
        ) : students && students.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <Card key={student.id} className="qr-card">
                <CardHeader>
                  <CardTitle className="text-lg">{student.name}</CardTitle>
                  <CardDescription>
                    Mã SV: {student.studentId}
                    {student.major && ` • ${student.major}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    <canvas
                      ref={(el) => {
                        canvasRefs.current[student.id] = el;
                      }}
                      className="border rounded-lg p-2 bg-white"
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="w-full no-print"
                    onClick={() =>
                      handleDownload(student.id, student.name, student.qrCode)
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Tải xuống
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">
                Chưa có sinh viên nào. Vui lòng thêm sinh viên trước.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          .qr-card {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}

