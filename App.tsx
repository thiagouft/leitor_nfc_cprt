import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import NfcManager, { NfcTech } from "react-native-nfc-manager";

export default function App() {
  const [rfidId, setRfidId] = useState<string | null>(null);
  const [rfidIdInverted, setRfidIdInverted] = useState<string | null>(null);
  const [rfidDecimal, setRfidDecimal] = useState<string | null>(null);
  const [rfidDecimalInverted, setRfidDecimalInverted] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<string | null>(null);

  useEffect(() => {
    NfcManager.start();
    startReadingNFC();
    return () => {
      NfcManager.cancelTechnologyRequest().catch(() => {});
    };
  }, []);

  const convertToDecimal = (hexId: string): string => {
    return parseInt(hexId, 16).toString();
  };

  const invertHexBytes = (hexId: string): string => {
    return hexId.match(/.{2}/g)?.reverse().join("") ?? hexId;
  };

  const getFormattedTimestamp = (): string => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  const startReadingNFC = async () => {
    try {
      while (true) {
        await NfcManager.requestTechnology(NfcTech.NfcA);
        const tag = await NfcManager.getTag();
        if (tag?.id) {
          const hexId = tag.id.toUpperCase();
          const invertedHexId = invertHexBytes(hexId);
          const decimalId = convertToDecimal(hexId);
          const decimalInvertedId = convertToDecimal(invertedHexId);
          const timestampValue = getFormattedTimestamp();
          
          setRfidId(hexId);
          setRfidIdInverted(invertedHexId);
          setRfidDecimal(decimalId);
          setRfidDecimalInverted(decimalInvertedId);
          setTimestamp(timestampValue);
        }
        await NfcManager.cancelTechnologyRequest();
      }
    } catch (ex) {
      console.warn("Erro ao ler NFC:", ex);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leitor RFID NFC</Text>
      <Text style={styles.rfidText}>{rfidId ? `ID: ${rfidId}` : "Aproxime um cartão RFID"}</Text>
      <Text style={styles.rfidText}>{rfidIdInverted ? `ID Invertido: ${rfidIdInverted}` : ""}</Text>
      <Text style={styles.rfidText}>{rfidDecimal ? `Decimal: ${rfidDecimal}` : ""}</Text>
      <Text style={styles.rfidText}>{rfidDecimalInverted ? `Decimal (Little-Endian): ${rfidDecimalInverted}` : ""}</Text>
      <Text style={styles.rfidText}>{timestamp ? `Data/Hora: ${timestamp}` : ""}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  rfidText: {
    fontSize: 18,
    color: "blue",
  },
});
