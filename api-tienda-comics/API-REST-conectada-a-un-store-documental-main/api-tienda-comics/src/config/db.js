import mongoose from "mongoose";

export async function conectarDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes("TU_CLUSTER") || uri.includes("CLAVE_CODIFICADA")) {
    throw new Error("Configura MONGODB_URI en .env con los datos de tu clúster.");
  }
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
}
