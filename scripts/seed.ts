import { drizzle } from "drizzle-orm/mysql2";
import { booths, students } from "../drizzle/schema";

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const db = drizzle(process.env.DATABASE_URL);

  console.log("🌱 Seeding database...");

  try {
    // Thêm booths
    console.log("📦 Adding booths...");
    const boothsData = [
      {
        name: "Booth Công nghệ thông tin",
        description: "Giới thiệu về ngành CNTT và các dự án sinh viên",
        location: "Khu A - Tầng 1",
        isActive: 1,
      },
      {
        name: "Booth Kinh tế",
        description: "Tư vấn nghề nghiệp và cơ hội việc làm",
        location: "Khu A - Tầng 2",
        isActive: 1,
      },
      {
        name: "Booth Ngoại ngữ",
        description: "Trải nghiệm học tập đa văn hóa",
        location: "Khu B - Tầng 1",
        isActive: 1,
      },
      {
        name: "Booth Thiết kế đồ họa",
        description: "Triển lãm các tác phẩm thiết kế",
        location: "Khu B - Tầng 2",
        isActive: 1,
      },
      {
        name: "Booth Marketing",
        description: "Workshop về marketing số",
        location: "Khu C - Tầng 1",
        isActive: 1,
      },
    ];

    for (const booth of boothsData) {
      await db.insert(booths).values(booth);
      console.log(`✅ Added booth: ${booth.name}`);
    }

    // Thêm students
    console.log("\n👨‍🎓 Adding students...");
    const studentsData = [
      {
        studentId: "SV001",
        name: "Nguyễn Văn An",
        email: "an.nguyen@university.edu",
        phone: "0901234567",
        major: "Công nghệ thông tin",
        year: 3,
        qrCode: "SV001",
      },
      {
        studentId: "SV002",
        name: "Trần Thị Bình",
        email: "binh.tran@university.edu",
        phone: "0902234567",
        major: "Kinh tế",
        year: 2,
        qrCode: "SV002",
      },
      {
        studentId: "SV003",
        name: "Lê Hoàng Cường",
        email: "cuong.le@university.edu",
        phone: "0903234567",
        major: "Công nghệ thông tin",
        year: 4,
        qrCode: "SV003",
      },
      {
        studentId: "SV004",
        name: "Phạm Thị Dung",
        email: "dung.pham@university.edu",
        phone: "0904234567",
        major: "Ngoại ngữ",
        year: 1,
        qrCode: "SV004",
      },
      {
        studentId: "SV005",
        name: "Hoàng Văn Em",
        email: "em.hoang@university.edu",
        phone: "0905234567",
        major: "Thiết kế đồ họa",
        year: 2,
        qrCode: "SV005",
      },
      {
        studentId: "SV006",
        name: "Võ Thị Phương",
        email: "phuong.vo@university.edu",
        phone: "0906234567",
        major: "Marketing",
        year: 3,
        qrCode: "SV006",
      },
      {
        studentId: "SV007",
        name: "Đặng Văn Giang",
        email: "giang.dang@university.edu",
        phone: "0907234567",
        major: "Công nghệ thông tin",
        year: 2,
        qrCode: "SV007",
      },
      {
        studentId: "SV008",
        name: "Bùi Thị Hà",
        email: "ha.bui@university.edu",
        phone: "0908234567",
        major: "Kinh tế",
        year: 4,
        qrCode: "SV008",
      },
      {
        studentId: "SV009",
        name: "Ngô Văn Hùng",
        email: "hung.ngo@university.edu",
        phone: "0909234567",
        major: "Ngoại ngữ",
        year: 3,
        qrCode: "SV009",
      },
      {
        studentId: "SV010",
        name: "Lý Thị Lan",
        email: "lan.ly@university.edu",
        phone: "0910234567",
        major: "Thiết kế đồ họa",
        year: 1,
        qrCode: "SV010",
      },
    ];

    for (const student of studentsData) {
      await db.insert(students).values(student);
      console.log(`✅ Added student: ${student.name} (${student.studentId})`);
    }

    console.log("\n✨ Seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Booths: ${boothsData.length}`);
    console.log(`   - Students: ${studentsData.length}`);
    console.log("\n💡 Tips:");
    console.log("   - Để test quét QR, sử dụng mã sinh viên (VD: SV001, SV002, ...)");
    console.log("   - Bạn có thể tạo QR code từ các mã này tại: https://www.qr-code-generator.com/");
    console.log("   - Hoặc sử dụng công cụ tạo QR code online khác");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();

