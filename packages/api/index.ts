import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import { MongoClient } from "mongodb";

dotenv.config();

if (process.env.NODE_ENV !== 'production' && !process.env.DATABASE_URL) {
  await import('./db/startAndSeedMemoryDB');
}

const PORT = process.env.PORT || 3001;
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
const DATABASE_URL = process.env.DATABASE_URL;

const app = express();

app.use(cors())
app.use(express.json());

app.get('/search', async (req, res) => {
  const mongoClient = new MongoClient(DATABASE_URL);
  console.log('Connecting to MongoDB...');

	const searchQuery = req.query.q as string || '';

	if (!searchQuery) {
		res.json({
			hotels: [],
			cities: [],
			countries: []
		});

		return;
	}

  try {
    await mongoClient.connect();
    console.log('Successfully connected to MongoDB!');
    const db = mongoClient.db()

		const hotelsQuery = {
			$or: [
				{ hotel_name: { $regex: searchQuery, $options: 'i' } },
				{ chain_name: { $regex: searchQuery, $options: 'i' } },
				{ city: { $regex: searchQuery, $options: 'i' } },
				{ country: { $regex: searchQuery, $options: 'i' } },
			]
		};

		const citiesQuery = {
			name: { $regex: searchQuery, $options: 'i' }
		};

		const countriesQuery = {
			country: { $regex: searchQuery, $options: 'i' }
		};

		const [hotels, cities, countries] = await Promise.all([
			db.collection('hotels').find(hotelsQuery).toArray(),
			db.collection('cities').find(citiesQuery).toArray(),
			db.collection('countries').find(countriesQuery).toArray(),
		]);

		const payload = {
			hotels,
			cities,
			countries
		};

    res.send(payload);
  } finally {
    await mongoClient.close();
  }
})

app.listen(PORT, () => {
  console.log(`API Server Started at ${PORT}`)
})
