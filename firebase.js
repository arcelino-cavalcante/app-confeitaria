const firebaseConfig = {
    apiKey: "AIzaSyCrbvnm7NYwjfGBUuCFOcz4Q_eluBo6dXY",
    authDomain: "banco-de-dados-confeitaria.firebaseapp.com",
    projectId: "banco-de-dados-confeitaria",
    storageBucket: "banco-de-dados-confeitaria.firebasestorage.app",
    messagingSenderId: "810757497811",
    appId: "1:810757497811:web:afcd004ba61ced347a4526"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();