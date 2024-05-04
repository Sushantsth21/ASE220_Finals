import express from "express";
import fs from "fs";
import path from "path";
import authRoutes from "./routes/authRoutes.mjs";
import mongoose from "mongoose";
import { MongoURL } from "./config.mjs";
import cookieParser from "cookie-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { requireAuth, checkUser } from "./authMiddleware.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001; // Change 3000 to 3001 or another available port

mongoose
  .connect(MongoURL)
  .then(() => {
    console.log("MongoDB is connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(express.json());

app.use(express.static("public"));

app.use(cookieParser());

app.get("*", checkUser);

app.get("/apartments", (req, res) => {
  fs.readFile(path.join(__dirname, "apartments.json"), "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Error reading the apartments data");
    } else {
      res.type("json").send(JSON.parse(data));
    }
  });
});

app.post("/apartments", (req, res) => {
  const newApartment = req.body; // Assuming the incoming data is already validated

  fs.readFile(path.join(__dirname, "apartments.json"), "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Error reading the apartments data");
    }

    let apartments;
    try {
      apartments = JSON.parse(data);
    } catch (parseErr) {
      return res.status(500).send("Error parsing the apartments data");
    }

    apartments.push(newApartment);
    fs.writeFile(
      path.join(__dirname, "apartments.json"),
      JSON.stringify(apartments, null, 2),
      "utf8",
      (writeErr) => {
        if (writeErr) {
          return res.status(500).send("Error writing the apartments data");
        }

        res.status(201).json(newApartment);
      }
    );
  });
});

app.delete("/apartments/:unit_number", (req, res) => {
  const unitNumber = req.params.unit_number;

  fs.readFile(path.join(__dirname, "apartments.json"), "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Error reading the apartments data");
    }

    let apartments;
    try {
      apartments = JSON.parse(data);
    } catch (parseErr) {
      return res.status(500).send("Error parsing the apartments data");
    }

    if (!Array.isArray(apartments)) {
      return res.status(500).send("Apartment data is not an array");
    }

    const index = apartments.findIndex(
      (apartment) => apartment.unit_number === unitNumber
    );

    if (index !== -1) {
      apartments.splice(index, 1);

      fs.writeFile(
        path.join(__dirname, "apartments.json"),
        JSON.stringify(apartments, null, 2),
        "utf8",
        (writeErr) => {
          if (writeErr) {
            return res.status(500).send("Error writing the apartments data");
          }

          res.status(204).send();
        }
      );
    } else {
      res.status(404).send({ message: "Apartment not found" });
    }
  });
});

app.put("/apartments/:unit_number", (req, res) => {
  const unitNumber = req.params.unit_number;
  const updatedApartment = req.body;

  fs.readFile(path.join(__dirname, "apartments.json"), "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Error reading the apartments data");
    }

    let apartments;
    try {
      apartments = JSON.parse(data);
    } catch (parseErr) {
      return res.status(500).send("Error parsing the apartments data");
    }

    const index = apartments.findIndex(
      (apartment) => apartment.unit_number === unitNumber
    );

    if (index !== -1) {
      apartments[index] = { ...apartments[index], ...updatedApartment };

      fs.writeFile(
        path.join(__dirname, "apartments.json"),
        JSON.stringify(apartments, null, 2),
        "utf8",
        (writeErr) => {
          if (writeErr) {
            return res.status(500).send("Error writing the apartments data");
          }

          res.status(200).json(apartments[index]);
        }
      );
    } else {
      res.status(404).send({ message: "Apartment not found" });
    }
  });
});

// Utility to read and write user data
const readUserData = async () => {
  try {
    const data = await fs.promises.readFile(
      path.join(__dirname, "users.json"),
      "utf8"
    );
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading user data", err);
    throw err;
  }
};

const writeUserData = async (data) => {
  try {
    await fs.promises.writeFile(
      path.join(__dirname, "users.json"),
      JSON.stringify(data, null, 2),
      "utf8"
    );
  } catch (err) {
    console.error("Error writing user data", err);
    throw err;
  }
};

// Protected route example
app.get("/apartments", (req, res) => {
  fs.readFile(path.join(__dirname, "apartments.json"), "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Error reading the apartments data");
    } else {
      res.type("json").send(JSON.parse(data));
    }
  });
});

// In server.mjs
app.get("/current-user", checkUser, (req, res) => {
  if (res.locals.user) {
    res.json({ email: res.locals.user.email });
  } else {
    res.status(401).json({ message: "No user logged in" });
  }
});

app.use(authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
