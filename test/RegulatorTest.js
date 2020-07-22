const VerifierContract = artifacts.require("Verifier");

contract("Verifier", (accounts) => {

  let verifier;

  beforeEach(async () => {
    verifier = await VerifierContract.new({from: accounts[0]})
  })

  describe("verifyTx", () => {
    it("can do simple test", async () => {
      assert.equal(1,1,"not equal");
    })

    it("returns true with valid proof", async () => {
      const a = ["0x1d3f567420a9f5508ba79005719575ad52a417befedaa9f741da77cd077e7295", "0x0801d49ae08ac90f341c5e344b607f660fe4135053b795a648ec6a670458805b"]
      const b = [["0x0aa90c83ecdfd9f57f67ce0d8e6d5ce36b21b421c3ef8fb6f1f90c1397a1668c", "0x033391ebb08cd9668e6c6c4e0cbd4af18162503c553f80148b8f45a054368e9a"], ["0x2124ea4ed636a72720220077c12b2aa6a142b87940763880b526f3c9087ae942", "0x197bd6bd23a1a473d6f6f3be0d0db5909fbf65a19c42552db37187a695240415"]]
      const c = ["0x07239e2277560a8b1e15745cf0b889a474f948ac21ab120870d99cddeff4f8b9", "0x132256514f9dcf48754cdbc485e604a7a32e3c235e31b26bfb8981d527c15b3b"]
      const inputs = ["0x0000000000000000000000000000000000000000000000000000000000000001"]

      const tx = await verifier.verifyTx.call(a, b, c, inputs)
      assert.isTrue(tx, "should be true")
    })

    it("emits Verified event with valid proof", async () => {
      const a = ["0x1d3f567420a9f5508ba79005719575ad52a417befedaa9f741da77cd077e7295", "0x0801d49ae08ac90f341c5e344b607f660fe4135053b795a648ec6a670458805b"]
      const b = [["0x0aa90c83ecdfd9f57f67ce0d8e6d5ce36b21b421c3ef8fb6f1f90c1397a1668c", "0x033391ebb08cd9668e6c6c4e0cbd4af18162503c553f80148b8f45a054368e9a"], ["0x2124ea4ed636a72720220077c12b2aa6a142b87940763880b526f3c9087ae942", "0x197bd6bd23a1a473d6f6f3be0d0db5909fbf65a19c42552db37187a695240415"]]
      const c = ["0x07239e2277560a8b1e15745cf0b889a474f948ac21ab120870d99cddeff4f8b9", "0x132256514f9dcf48754cdbc485e604a7a32e3c235e31b26bfb8981d527c15b3b"]
      const inputs = ["0x0000000000000000000000000000000000000000000000000000000000000001"]

      const tx = await verifier.verifyTx(a, b, c, inputs)
      expectedEvent = "Verified"
      actualEvent = tx.logs[0].event
      assert.equal(actualEvent, expectedEvent, "should be same")
    })

    it("returns false with invalid proof", async () => {
      const a = ["0x107c19e1064e63446c42ee3ca6326c27368900f268225fdacd377e722cc88924", "0x1b104e625b1b74eff188e55271f06d1532c81155bbc671c1b29e7a95bd3ae8a9"]
      const b = [["0x0aa90c83ecdfd9f57f67ce0d8e6d5ce36b21b421c3ef8fb6f1f90c1397a1668c", "0x033391ebb08cd9668e6c6c4e0cbd4af18162503c553f80148b8f45a054368e9a"], ["0x2124ea4ed636a72720220077c12b2aa6a142b87940763880b526f3c9087ae942", "0x197bd6bd23a1a473d6f6f3be0d0db5909fbf65a19c42552db37187a695240415"]]
      const c = ["0x1773f80771c025e63002d3203b68c2a87295ee5dace5a817eb8f95753611b56e", "0x2baa5e48823085a05327f656500d2dd59e6fc6378516bbaa43a7ce3eb0f52009"]
      const inputs = ["0x00000000000000000000000000000000c6481e22c5ff4164af680b8cfaa5e8ed"]

      const result = await verifier.verifyTx.call(a, b, c, inputs)
      assert.isFalse(result, "should be true");
    })
  })
})
