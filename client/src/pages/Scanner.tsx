import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Html5Qrcode } from "html5-qrcode";
import { CheckCircle2, QrCode, XCircle, Camera, CameraOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function Scanner() {
  const { user } = useAuth();
  const [selectedBoothId, setSelectedBoothId] = useState<string>("");
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState<{
    success: boolean;
    message: string;
    student?: any;
  } | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrCodeRegionId = "qr-reader";

  const { data: booths } = trpc.booths.list.useQuery();
  const { data: myBooths } = trpc.booths.myBooths.useQuery();

  const isAdmin = user?.role === 'admin';
  const availableBooths = isAdmin ? booths : myBooths;

  const scanMutation = trpc.attendance.scan.useMutation({
    onSuccess: (data) => {
      setLastScan({
        success: true,
        message: `Đã ghi nhận ${data.student.name} tham dự!`,
        student: data.student,
      });
      toast.success(`Đã ghi nhận ${data.student.name} tham dự!`);
      
      // Auto-clear after 3 seconds
      setTimeout(() => {
        setLastScan(null);
      }, 3000);
    },
    onError: (error) => {
      setLastScan({
        success: false,
        message: error.message,
      });
      toast.error(error.message);
      
      // Auto-clear after 3 seconds
      setTimeout(() => {
        setLastScan(null);
      }, 3000);
    },
  });

  const startScanning = async () => {
    if (!selectedBoothId) {
      toast.error("Vui lòng chọn booth trước khi quét");
      return;
    }

    try {
      const html5QrCode = new Html5Qrcode(qrCodeRegionId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Handle successful scan
          scanMutation.mutate({
            qrCode: decodedText,
            boothId: parseInt(selectedBoothId),
          });
        },
        (errorMessage) => {
          // Handle scan error (can be ignored for continuous scanning)
        }
      );

      setScanning(true);
    } catch (err) {
      console.error("Error starting scanner:", err);
      toast.error("Không thể khởi động camera. Vui lòng kiểm tra quyền truy cập.");
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
        setScanning(false);
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  useEffect(() => {
    // Auto-select booth if user has only one
    if (availableBooths && availableBooths.length === 1 && !selectedBoothId) {
      setSelectedBoothId(availableBooths[0].id.toString());
    }
  }, [availableBooths, selectedBoothId]);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Quét mã QR</h1>
          <p className="text-gray-600 mt-2">
            Quét mã QR của sinh viên để ghi nhận tham dự booth
          </p>
        </div>

        {/* Booth Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Chọn Booth</CardTitle>
            <CardDescription>
              Chọn booth bạn muốn ghi nhận tham dự
            </CardDescription>
          </CardHeader>
          <CardContent>
            {availableBooths && availableBooths.length > 0 ? (
              <Select
                value={selectedBoothId}
                onValueChange={setSelectedBoothId}
                disabled={scanning}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn booth..." />
                </SelectTrigger>
                <SelectContent>
                  {availableBooths.map((booth) => (
                    <SelectItem key={booth.id} value={booth.id.toString()}>
                      {booth.name}
                      {booth.location && ` - ${booth.location}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Bạn chưa được gán booth nào.</p>
                {isAdmin && <p className="text-sm mt-2">Vui lòng tạo booth trước.</p>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scanner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Máy quét QR
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* QR Scanner Region */}
            <div className="relative">
              <div
                id={qrCodeRegionId}
                className="w-full rounded-lg overflow-hidden bg-gray-100"
                style={{ minHeight: scanning ? "auto" : "300px" }}
              >
                {!scanning && (
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="text-center">
                      <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        Nhấn "Bắt đầu quét" để khởi động camera
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3">
              {!scanning ? (
                <Button
                  onClick={startScanning}
                  disabled={!selectedBoothId}
                  className="flex-1"
                  size="lg"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Bắt đầu quét
                </Button>
              ) : (
                <Button
                  onClick={stopScanning}
                  variant="destructive"
                  className="flex-1"
                  size="lg"
                >
                  <CameraOff className="h-5 w-5 mr-2" />
                  Dừng quét
                </Button>
              )}
            </div>

            {/* Last Scan Result */}
            {lastScan && (
              <div
                className={`p-4 rounded-lg border-2 ${
                  lastScan.success
                    ? "bg-green-50 border-green-500"
                    : "bg-red-50 border-red-500"
                }`}
              >
                <div className="flex items-start gap-3">
                  {lastScan.success ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`font-semibold ${
                        lastScan.success ? "text-green-900" : "text-red-900"
                      }`}
                    >
                      {lastScan.success ? "Thành công!" : "Lỗi"}
                    </p>
                    <p
                      className={`text-sm mt-1 ${
                        lastScan.success ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {lastScan.message}
                    </p>
                    {lastScan.student && (
                      <div className="mt-2 text-sm text-green-700">
                        <p>Mã SV: {lastScan.student.studentId}</p>
                        {lastScan.student.major && (
                          <p>Ngành: {lastScan.student.major}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Hướng dẫn sử dụng</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800 space-y-2">
            <ol className="list-decimal list-inside space-y-2">
              <li>Chọn booth bạn muốn ghi nhận tham dự</li>
              <li>Nhấn "Bắt đầu quét" để khởi động camera</li>
              <li>Hướng camera vào mã QR của sinh viên</li>
              <li>Hệ thống sẽ tự động ghi nhận khi quét thành công</li>
              <li>Tiếp tục quét các sinh viên khác hoặc nhấn "Dừng quét" khi hoàn tất</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

