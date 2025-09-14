/* eslint-disable */
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TextInput, Button, ScrollView, Image, TouchableOpacity } from "react-native";
import { auth, db, storage } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);

  // ✅ Check login state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        await fetchProducts();
        await fetchOrders(u.email);
      } else {
        setUser(null);
      }
    });
    return () => unsub();
  }, []);

  // ✅ Auth
  const handleAuth = async () => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // ✅ Products
  const fetchProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setNewImage(result.assets[0].uri);
    }
  };

  const addProduct = async () => {
    if (!newProduct || !newPrice || !newDescription || !newImage) {
      alert("Fill all fields and choose an image");
      return;
    }
    const img = await fetch(newImage);
    const bytes = await img.blob();
    const imgRef = ref(storage, `products/${Date.now()}.jpg`);
    await uploadBytes(imgRef, bytes);
    const imageUrl = await getDownloadURL(imgRef);

    await addDoc(collection(db, "products"), {
      name: newProduct,
      price: parseFloat(newPrice),
      description: newDescription,
      imageUrl,
      owner: user.email,
      createdAt: new Date().toISOString(),
    });

    setNewProduct("");
    setNewPrice("");
    setNewDescription("");
    setNewImage(null);
    fetchProducts();
  };

  const deleteProduct = async (id, owner) => {
    if (user.email !== owner) return alert("You can only delete your own product");
    await deleteDoc(doc(db, "products", id));
    fetchProducts();
  };

  // ✅ Cart
  const addToCart = (p) => {
    setCart((prev) => [...prev, p]);
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  };

  const checkout = async () => {
    if (cart.length === 0) return alert("Cart empty");
    const commission = 200;
    const total = cart.reduce((s, p) => s + p.price, 0) + commission;
    await addDoc(collection(db, "orders"), {
      buyer: user.email,
      items: cart,
      commission,
      total,
      status: "Pending Delivery",
      createdAt: new Date().toISOString(),
    });
    setCart([]);
    fetchOrders(user.email);
    alert("Order placed successfully");
  };

  // ✅ Orders
  const fetchOrders = async (email) => {
    const q = query(collection(db, "orders"), where("buyer", "==", email));
    const snap = await getDocs(q);
    setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  // ================= UI =================
  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{isLogin ? "Login" : "Sign Up"}</Text>
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
        <Button title={isLogin ? "Login" : "Sign Up"} onPress={handleAuth} />
        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.link}>
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={{ padding: 20, marginTop: 40 }}>
      <Text style={styles.title}>Welcome {user.email}</Text>
      <Button title="Logout" onPress={handleLogout} />

      {/* Add Product */}
      <Text style={styles.section}>Sell a Product</Text>
      <TextInput style={styles.input} placeholder="Product name" value={newProduct} onChangeText={setNewProduct} />
      <TextInput style={styles.input} placeholder="Price" keyboardType="numeric" value={newPrice} onChangeText={setNewPrice} />
      <TextInput style={styles.input} placeholder="Description" value={newDescription} onChangeText={setNewDescription} />
      <Button title="Pick Image" onPress={pickImage} />
      {newImage && <Image source={{ uri: newImage }} style={{ width: "100%", height: 150, marginVertical: 10 }} />}
      <Button title="Add Product" onPress={addProduct} />

      {/* Products */}
      <Text style={styles.section}>Available Products</Text>
      {products.map((p) => (
        <View key={p.id} style={styles.product}>
          {p.imageUrl && <Image source={{ uri: p.imageUrl }} style={{ width: "100%", height: 150 }} />}
          <Text style={styles.bold}>{p.name}</Text>
          <Text>₦{p.price}</Text>
          <Text>{p.description}</Text>
          <Button title="Add to Cart" onPress={() => addToCart(p)} />
          {p.owner === user.email && <Button title="Delete" color="red" onPress={() => deleteProduct(p.id, p.owner)} />}
        </View>
      ))}

      {/* Cart */}
      <Text style={styles.section}>My Cart</Text>
      {cart.map((c) => (
        <View key={c.id} style={styles.cart}>
          <Text>{c.name} - ₦{c.price}</Text>
          <Button title="Remove" onPress={() => removeFromCart(c.id)} />
        </View>
      ))}
      {cart.length > 0 && <Button title="Checkout" onPress={checkout} />}

      {/* Orders */}
      <Text style={styles.section}>My Orders</Text>
      {orders.map((o) => (
        <View key={o.id} style={styles.order}>
          {o.items.map((i) => (
            <Text key={i.id}>{i.name} - ₦{i.price}</Text>
          ))}
          <Text>Total: ₦{o.total}</Text>
          <Text>Status: {o.status}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, width: "100%", marginBottom: 10, borderRadius: 5 },
  link: { marginTop: 10, color: "blue" },
  section: { fontSize: 20, fontWeight: "bold", marginVertical: 10 },
  product: { marginBottom: 20, padding: 10, borderWidth: 1, borderColor: "#ddd", borderRadius: 8 },
  bold: { fontWeight: "bold", fontSize: 16 },
  cart: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 5 },
  order: { marginBottom: 10, padding: 10, borderWidth: 1, borderColor: "#ddd", borderRadius: 8 },
});
