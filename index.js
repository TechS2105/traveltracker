import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const db = new pg.Client({

  user: "postgres",
  host: "localhost",
  database: "world",
  password: "12345",
  port: 5432

});

db.connect();

async function checkedCountry() {
  
  const result = await db.query("SELECT country_code FROM country_visit");
  let countries = [];
  result.rows.forEach((country) => {

    countries.push(country.country_code);

  });

  return countries;

}

app.get('/', async (req, res) => {

  const countries = await checkedCountry();
  res.render("index.ejs", { countries: countries, total: countries.length });

});

app.post('/add', async (req, res) => {
  
  const input = req.body.country;

  try {
    const result = await db.query("SELECT country_code FROM countries WHERE country_name = $1", [input]);

    const data = result.rows[0];
    const countryCode = data.country_code;

    try {
      await db.query("INSERT INTO country_visit(country_code) VALUES($1)", [countryCode]);
      res.redirect('/');
    } catch(err) {
      
      console.log(err);
      const countries = await checkedCountry();
      res.render("index.ejs", { countries: countries, total: countries.length, error: "Country code has already exists" });

    }
  } catch (err) {
    
    console.log(err);
    const countries = await checkedCountry();
    res.render("index.ejs", { countries: countries, total: countries.length, error: "Enter valid country code" });

  }

});

app.listen(port, () => {

  console.log(`Server is started on ${port} port`);

});