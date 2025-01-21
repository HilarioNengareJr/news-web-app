import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, (err) => {
    if(err){
        console.error("Something went wrong:\n", err);
    } else {
        console.log(`Server is running on http://localhost:${PORT}`);
    }
});