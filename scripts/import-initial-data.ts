import { ensureExerciseDatasetImported } from "@/lib/bootstrap/import-exercises";

async function main() {
  try {
    await ensureExerciseDatasetImported();
    console.log("Initial exercise dataset imported successfully.");
  } catch (error) {
    console.error("Failed to import initial exercise dataset.");
    console.error(error);
    process.exitCode = 1;
  }
}

void main();
