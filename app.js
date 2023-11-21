const express = require('express');
const path = require('path');
const qr = require('qrcode');
const admin = require('firebase-admin');
const serviceAccount = require('./connection-firebase.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const app = express();
const PORT = process.env.PORT || 3000;

// app.set('view engine', 'ejs');
// app.use(express.static('public'));
app.use(express.json());

app.get('/getInfoFromQRCode/:productID', async (req, res) => {
  try {
    const { productID } = req.params;

    // Mengambil data produk dari Firestore berdasarkan ID
    const productSnapshot = await db
      .collection('verifiedPartner')
      .doc('Politeknik Negeri Jakarta')
      .collection('products')
      .doc(productID)
      .get();

    if (!productSnapshot.exists) {
      return res.status(404).send('Produk tidak ditemukan');
    }
    const productData = productSnapshot.data();

    const jsonResponse = {
      'Nama Produk': productData.name,
      material: productData.material,
      Deskripsi: productData.deskripsi,
      Packaging: productData.pacakaging,
      Price: productData.price,
      Proses: productData.proses,
      Tag: productData.tag,
    };

    const qrCode = await qr.toDataURL(JSON.stringify(jsonResponse));

    res.send(qrCode);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
