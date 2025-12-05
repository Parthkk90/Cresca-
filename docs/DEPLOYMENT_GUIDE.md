# Deployment Guide

This file provides minimal deployment notes for the AptPays smart contracts.

- Bucket Protocol: `0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b`
- Calendar Payments: `0x0f9713e3c42951dbc4f05cc2e7ea211c1851b00a9d077e7e71f5d2a73041d606`
- Smart Wallet: `0x2bc654f1f5009c045ba5486d11252d46724d7e0522db6dbde2ff0fe7e275a1bf`

Quick deploy steps (testnet):

1. Compile

   aptos move compile --named-addresses cresca=0xYOURADDR

2. Publish

   aptos move publish --profile testnet

3. Verify

   Visit Aptos Explorer or use `aptos account list --account <address>`

