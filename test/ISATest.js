const ISAContract = artifacts.require("ISA")
const RegulatorContract = artifacts.require("Regulator")

contract("ISA", (accounts) => {
  let isa
  let regulator

  const lenderAddress = accounts[1]
  const borrowerAddress = accounts[2]
  const isaAmount = web3.utils.toWei('10', 'ether')
  const incomePercentage = 10
  const timePeriod = 18
  const minimumIncome = web3.utils.toWei('5', 'ether')
  const paymentCap = web3.utils.toWei('20', 'ether')
  const symbol = "ABC"

  beforeEach(async () => {
    regulator = await RegulatorContract.deployed()
    isa = await ISAContract.new(
      lenderAddress,
      borrowerAddress,
      isaAmount,
      incomePercentage,
      timePeriod,
      minimumIncome,
      paymentCap,
      symbol,
      regulator,
      {from: accounts[0]}
    )
  })

  describe("isLender", () => {
    it("returns true for lenders", async () => {
      var lender = await isa.isLender(lenderAddress)
      assert.equal(lender, true, "should be true")
    })

    it("returns false for non-lenders", async () => {
      var lender = await isa.isLender(borrowerAddress)
      assert.equal(lender, false, "should be false")
    })
  })

  describe("isBorrower", () => {
    it("returns true for borrowers", async () => {
      var borrower = await isa.isBorrower(borrowerAddress)
      assert.equal(borrower, true, "should be true")
    })

    it("returns false for non-borrowers", async () => {
      var borrower = await isa.isBorrower(borrowerAddress)
      assert.equal(borrower, false, "should be false")
    })
  })

  describe("startISA", () => {
    it("sets started to true", async () => {
      await isa.startISA({from: lenderAddress})
      var started = await isa.started()
      assert.equal(started, true, "should be true")
    })

    it("sets lender balance to totalSupply", async () {
      await isa.startISA({from: lenderAddress})
      var balance = await isa.balanceOf(lenderAddress)
      var totalSupply = await isa.totalSupply()
      assert.equal(balance, totalSupply, "should be the same")
    })
  })

  describe("payIncome", () => {
    it("increments totalPaid", async () => {
      var initialPaid = await isa.totalPaid()
      await isa.payIncome({from: borrowerAddress, value:web3.utils.toWei('7', 'ether')})
      var afterPaid = await isa.totalPaid()

      var diff = afterPaid - initialPaid
      assert.equal(diff, web3.utils.toWei('7', 'ether'), "should be same")
    })
  })

  describe("buyoutISA", () => {
    it("increments totalPaid", async () => {
      var initialPaid = await isa.totalPaid()
      var buyoutAmount = await isa.buyoutAmount()
      await isa.buyoutISA({from: borrowerAddress, value:buyoutAmount})
      var afterPaid = await isa.totalPaid()

      var diff = afterPaid - initialPaid
      assert.equal(diff, buyoutAmount, "should be same")
    })

    it("sets ended to true", async () => {
      var buyoutAmount = await isa.buyoutAmount()
      await isa.buyoutISA({from: borrowerAddress, value:buyoutAmount})
      var ended = await isa.ended()
      assert.equal(ended, true, "should be true")
    })

    it("sets balance of lender to zero", async () => {
      var buyoutAmount = await isa.buyoutAmount()
      await isa.buyoutISA({from: borrowerAddress, value:buyoutAmount})
      var balance = await isa.balanceOf(lenderAddress)
      assert.equal(balance, 0, "should be 0")
    })
  })
})
