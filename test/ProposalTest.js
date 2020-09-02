const ProposalContract = artifacts.require("Proposal");
const RegulatorContract = artifacts.require("Regulator")

contract("Proposal", (accounts) => {

    let proposal;
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
      proposal = await ProposalContract.new(
        lenderAddress,
        borrowerAddress,
        isaAmount,
        incomePercentage,
        timePeriod,
        minimumIncome,
        paymentCap,
        symbol,
        regulator,
        {from: lenderAddress}
      )
    })

    describe("agree", () => {
      it("lender agrees", async () => {
        await proposal.agree({from: lenderAddress})

        var agree = await proposal.lenderAgree()
        assert.equal(agree, true, "agree should be true")
      })

      it("borrower agrees", async () => {
        await proposal.agree({from: borrowerAddress})

        var agree = await proposal.borrowerAgree()
        assert.equal(agree, true, "agree should be true")
      })

      it("both agree", async () => {
        await proposal.agree({from: lenderAddress})
        await proposal.agree({from: borrowerAddress})

        var agree = await proposal.bothAgree()
        assert.equal(agree, true, "agree should be true")
      })
    })

    describe("reject". () => {
      it("lender rejects", async () => {
        await proposal.reject({from: lenderAddress})

        var reject = await proposal.rejected({from: lenderAddress})
        assert.equal(reject, true, "reject should be true")
      })

      it("borrower rejects", async () => {
        await proposal.reject({from: borrowerAddress})

        var reject = await proposal.rejected({from: borrowerAddress})
        assert.equal(reject, true, "reject should be true")
      })
    })

    describe("isPending", () => {
      it("Pending for lender initially", async () => {
        var pending = await proposal.isPending({from: lenderAddress})

        assert.equal(pending, true, "pending should be true")
      })

      it("Pending for borrower initially", async () => {
        var pending = await proposal.isPending({from: borrowerAddress})

        assert.equal(pending, true, "pending should be true")
      })

      it("Not pending for lender after agreeing", async () => {
        await proposal.agree({from: lenderAddress})
        var pending = await proposal.isPending({from: lenderAddress})

        assert.equal(pending, false, "pending should be false")
      })

      it("Not pending for borrower after agreeing", async () => {
        await proposal.agree({from: borrowerAddress})
        var pending = await proposal.isPending({from: borrowerAddress})

        assert.equal(pending, false, "pending should be false")
      })
    })

    describe("isSigned", () => {
      it("Not signed for lender initally", async () => {
        var signed = await proposal.isSigned({from: lenderAddress})
        assert.equal(signed, false, "signed should be false")
      })

      it("Not signed for borrower initally", async () => {
        var signed = await proposal.isSigned({from: borrowerAddress})
        assert.equal(signed, false, "signed should be false")
      })

      it("Signed for lender after agreeing", async () => {
        await proposal.agree({from: lenderAddress})
        var signed = await proposal.isSigned({from: lenderAddress})
        assert.equal(signed, true, "signed should be true")
      })

      it("Signed for borrower after agreeing", async () => {
        await proposal.agree({from: borrowerAddress})
        var signed = await proposal.isSigned({from: borrowerAddress})
        assert.equal(signed, true, "signed should be true")
      })
    })
})
