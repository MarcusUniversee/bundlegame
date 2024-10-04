import { timeStamp } from './bundle';
import {app, firestore} from './firebaseConfig';
import { collection, doc, setDoc, getDoc, addDoc, arrayUnion, updateDoc, Timestamp } from "firebase/firestore";

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

//function for a random number given a seed
//written by CHATGPT
function hashSeed(seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = (hash * 31 + seed.charCodeAt(i)) % 2147483647;
    }
    return hash;
}
//written by CHAT GPT
function seededRandom(seed) {
    let x = seed % 2147483647;
    if (x <= 0) x += 2147483646;
    return function() {
        x = x * 16807 % 2147483647;
        return (x - 1) / 2147483646;
    };
}

function digitToHex(digit) {
    switch (digit) {
        case 10:
            return "A"
        case 11:
            return "B"
        case 12:
            return "C"
        case 13:
            return "D"
        case 14:
            return "E"
        case 15:
            return "F"
        default:
            return digit
    }
}

function generateNumber(random, modulo) {
    // Generate the first 3 digits randomly
    const first3Digits = [];
    for (let i = 0; i < 3; i++) {
        first3Digits.push(Math.floor(random() * 16)); // Random digit between 0-15
    }

    // Compute the checksum (4th digit)
    let total = 0;
    for (let i = 0; i < first3Digits.length; i++) {
        let digit = first3Digits[i];
        if (i == 1) {
            digit *= 2;
            if (digit > 15) {
                digit -= 15;
            }
        }
        total += digit;
        first3Digits[i] = digitToHex(digit)
    }

    // Calculate the checksum digit to make total % 16 === modulo
    const checksumDigit = digitToHex(((16 - (total % 16)) + modulo) % 16);
    
    first3Digits.push(checksumDigit);

    // Return the 4-digit number as a string
    return first3Digits.join('');
}

function generateToken(id) {
    const seed = hashSeed(id)
    const random = seededRandom(seed);
    let first = generateNumber(random, 11) //B
    let second = generateNumber(random, 0) //0
    let third = generateNumber(random, 11) //B
    let fourth = generateNumber(random, 10) //A
    return first + "-" + second + "-" + third + "-" + fourth
}

//returns 0 on error and 1 on success
export const authenticateUser = async (id, token) => {
    const userDocRef = doc(collection(firestore, 'Auth'), token);
    const userDocSnap = await getDoc(userDocRef)
    if (userDocSnap.exists()) {
        console.log("Retrieved user with token", token)
        if (userDocSnap.data().status == 2) {
            return 1
        }
        return 0
    }
    //token does not exist, generate a token for the user and see if matches
    if (generateToken(id) == token) {
        const data = {
            userid: id,
            status: 1
        }
        const userDocRef = doc(collection(firestore, 'Auth'), token);
        try {
            await setDoc(userDocRef, data);
            console.log("Document written with ID: ", token);
        } catch (error) {
            console.error("Error adding document: ", error);
        }
        return 1
    } else {
        return 0
    }
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
        console.log("Document updated with id: ", id)
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