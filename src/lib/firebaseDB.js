import { timeStamp } from './bundle';
import {app, firestore} from './firebaseConfig';
import { collection, doc, setDoc, getDocs, addDoc, arrayUnion, updateDoc, Timestamp } from "firebase/firestore";

export const createUser = async (id) => {
    const data = {
        earnings: 0,
        ordersComplete: 0,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
    }
    const userDocRef = doc(collection(firestore, 'Users'), id);

    try {
        await setDoc(userDocRef, data);
        console.log("Document written with ID: ", id);
    } catch (error) {
        console.error("Error adding document: ", error);
    }
    const actionDocRef = doc(collection(firestore, 'Users/' + id + '/Actions'), 'start')
    const actionData = {
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        earnings: 0,
        ordersComplete: 0,
        gametime: 0
    }

    try {
        await setDoc(actionDocRef, actionData)
        console.log("Start action written with id ", id);
    } catch (error) {
        console.error("Error creating actions collection: ", error);
    }
    
    return id
}

export const addAction = async (id, gamestate, name) => {
    const actionDocRef = doc(collection(firestore, 'Users/' + id + '/Actions'), name)
    gamestate.createdAt = Timestamp.fromDate(new Date())
    gamestate.updatedAt = Timestamp.fromDate(new Date())
    try {
        await setDoc(actionDocRef, gamestate)
        console.log("Start action written with id ", id);
    } catch (error) {
        console.error("Error creating actions collection: ", error);
    }
    return id
}

export const addOrder = async (id, gamestate, orderID) => {
    const orderDocRef = doc(collection(firestore, 'Users/' + id + '/Orders'), orderID)
    gamestate.createdAt = Timestamp.fromDate(new Date())
    gamestate.updatedAt = Timestamp.fromDate(new Date())
    try {
        await setDoc(orderDocRef, gamestate)
        console.log("Added an order with ", id);
    } catch (error) {
        console.error("Error adding order: ", error);
    }
    return id
}

export const updateOrder = async (id, gamestate, orderID) => {
    const orderDocRef = doc(collection(firestore, 'Users/' + id + '/Orders'), orderID)
    gamestate.updatedAt = Timestamp.fromDate(new Date())
    try {
        await updateDoc(orderDocRef, gamestate)
        console.log("Document updated with id: , id")
    } catch (error) {
        console.error("Error updating document: ", error);
    }
    return id
}

export const updateFields = async (id, gamestate) => {
    const userDocRef = doc(collection(firestore, 'Users'), id)
    gamestate.updatedAt = Timestamp.fromDate(new Date())
    try {
        await updateDoc(userDocRef, gamestate)
        console.log("Document updated with id: , id")
    } catch (error) {
        console.error("Error updating document: ", error);
    }
    return id
}