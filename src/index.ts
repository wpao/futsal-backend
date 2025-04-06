import express, { Request, NextFunction } from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import { PrismaClient, Prisma } from "@prisma/client";

// menerapkan JWT
import jwt from "jsonwebtoken";

// delete date last day
import cron from "node-cron";
// import { deleteExpiredData } from "";

cron.schedule("0 0 * * *", async () => {
  console.log("Running scheduled job to delete expired data...");
  await deleteExpiredData();
});

// create prisma client
// connection database
const prisma = new PrismaClient();

// create express app
const app = express();

// ini adalah middleware
// supaya express bisa menerima request body
app.use(express.json());

// Izinkan semua origin (Tidak disarankan untuk produksi)
app.use(cors());

// mengatur izin yang access
// app.use(cors({
//   origin: [/* "http://localhost:5173" */ "http://futsal-fe:80"],
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true,
// }));

// // interface
interface UserData {
  id: number;
  name: string;
  email: string;
}
interface ValidationRequest extends Request {
  userData: UserData;
}

// validate token setelah di buat pada /login
const accessValidator = (req: Request, res: any, next: NextFunction) => {
  const validationReq = req as ValidationRequest;
  const { authorization } = validationReq.headers;

  if (!authorization) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const token = authorization.split(" ")[1];
  const secret = process.env.JWT_SECRET;

  try {
    const jwtDecoded = jwt.verify(token, secret!);
    if (typeof jwtDecoded !== "string") {
      validationReq.userData = jwtDecoded as UserData;
    }
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  // lanjutkan ke pemanggilan controller
  next();
};

// register user
app.post("/users", async (req: Request, res: any) => {
  try {
    const { username, password, role, wa, namaLapangan } = req.body;

    // Cek apakah username sudah ada
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Cek apakah nomor wa sudah ada
    const existingWa = await prisma.user.findUnique({ where: { wa } });
    if (existingWa) {
      return res.status(400).json({ message: "Nomor wa already exists" });
    }

    // Enkripsi password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user baru dengan password yang sudah di-hash
    const user = await prisma.user.create({
      data: { username, password: hashedPassword, wa, namaLapangan, role },
    });

    res.status(201).json({ data: user, message: "User created successfully" });
  } catch (error) {
    console.error(error);

    // if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    //   return res.status(400).json({ message: "Username is already taken" });
    // }

    res.status(500).json({ message: "Internal Server Error" });
  }
});

// get all users
app.get("/users", async (_req, res) => {
  const users = await prisma.user.findMany();
  res.send(users);
});

// login user & automatically generate token
app.post("/login", async (req: Request, res: any) => {
  try {
    const { username, password } = req.body;

    // Cek apakah user ada
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Cek password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate JWT Token
    const secret = process.env.JWT_SECRET;
    // const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: "1h" });
    const token = jwt.sign(user, secret!, { expiresIn: "1h" });

    res.status(200).json({ message: "Login successful", data: user, token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// get user by id
app.get("/users/:id", async (req: Request, res: any) => {
  try {
    const { id } = req.params;

    // Cari user berdasarkan ID
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, role: true, wa: true }, // Hindari mengembalikan password
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ data: user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// delete user
app.delete(
  "/users/delete/:id",
  accessValidator,
  async (req: Request, res: any) => {
    try {
      const { id } = req.params;

      // Cek apakah user ada
      const existingUser = await prisma.user.findUnique({ where: { id } });
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Hapus user
      await prisma.user.delete({ where: { id } });

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// get all bookings
app.get("/bookings", async (_req, res) => {
  const bookings = await prisma.booking.findMany();
  res.send(bookings);
});

// booking
app.post("/bookings", accessValidator, async (req: Request, res: any) => {
  try {
    const { idUser, username, price, wa, time, date, isBayar } = req.body;

    // Pastikan `date` dalam format yang benar
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // console.log(parsedDate)

    // Buat booking
    const booking = await prisma.booking.create({
      data: {
        idUser,
        username,
        price: Number(price),
        wa,
        time: Number(time),
        date: parsedDate,
        isBayar: Boolean(isBayar),
      },
    });

    res
      .status(201)
      .json({ data: booking, message: "Booking created successfully" });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// filter booking date
// GET /bookings/filter?date=2025-02-19&idUser=1f746f94-0c8e-4360-8b1d-8d70ec62418f
app.get("/bookings/filter", async (req: Request, res: any) => {
  try {
    const { date, idUser } = req.query;

    let filter: any = {};

    // Validasi dan parsing tanggal
    if (date) {
      const parsedDate = new Date(date as string);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      // Pastikan filter hanya berdasarkan 'date' dan bukan 'createdAt'
      filter.date = parsedDate;
    }

    // Validasi idUser
    if (idUser) {
      filter.idUser = idUser as string;
    }

    // Query ke Prisma dengan filter
    const bookings = await prisma.booking.findMany({
      where: filter,
      orderBy: { date: "asc" },
    });

    res.status(200).json({ data: bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// delete booking
app.delete(
  "/bookings/delete/:id",
  accessValidator,
  async (req: Request, res: any) => {
    try {
      const { id } = req.params;

      // Cek apakah booking ada
      const existingBooking = await prisma.booking.findUnique({
        where: { id },
      });

      if (!existingBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Hapus booking
      await prisma.booking.delete({ where: { id } });

      res.status(200).json({ message: "Booking deleted successfully" });
    } catch (error) {
      console.error("Error deleting booking:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// edit or add info
// dua kondisi terbuat karna info tidak boleh mengandung dua info
app.post("/info", accessValidator, async (req: Request, res: any) => {
  try {
    const { content, idLapanganChange } = req.body;

    if (!content || !idLapanganChange) {
      return res
        .status(400)
        .json({ message: "Content and idLapanganChange are required" });
    }

    // Cek apakah data dengan idUser yang diberikan sudah ada
    const existingSchedule = await prisma.schedule.findFirst({
      where: { idUser: idLapanganChange },
    });

    let schedule;
    if (existingSchedule) {
      // Jika data sudah ada, lakukan update
      schedule = await prisma.schedule.update({
        where: { id: existingSchedule.id },
        data: { content },
      });
    } else {
      // Jika data belum ada, lakukan insert (create)
      schedule = await prisma.schedule.create({
        data: { content, idUser: idLapanganChange },
      });
    }

    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

// get one info
app.get("/info/:idUser", async (req: Request, res: any) => {
  try {
    const { idUser } = req.params;
    const schedule = await prisma.schedule.findMany({ where: { idUser } });
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

// delate data last day
export const deleteExpiredData = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set ke awal hari ini

  try {
    const deletedRecords = await prisma.booking.deleteMany({
      where: {
        date: {
          lt: today, // Hapus data yang tanggalnya lebih kecil dari hari ini
        },
      },
    });

    console.log(`Deleted ${deletedRecords.count} expired records.`);
  } catch (error) {
    console.error("Error deleting expired data:", error);
  }
};

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });

// app.listen(3000, "0.0.0.0", () => console.log("Server running on http://0.0.0.0:3000"));
