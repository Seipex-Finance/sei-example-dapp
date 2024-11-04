require("dotenv").config({ path: "../.env" });
const ethers = require("ethers");
const fs = require("fs");
const solc = require("solc");
const path = require("path");

const provider = new ethers.providers.WebSocketProvider(process.env.WS_RPC_URL);
const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);

function findImports(importPath) {
    const contractsDir = path.resolve(__dirname, '../contracts');
    const possiblePaths = [
        path.resolve(contractsDir, importPath),
        path.resolve(contractsDir, 'utils', importPath),
        path.resolve(contractsDir, importPath.replace('./', '')),
        path.resolve(contractsDir, 'utils', importPath.replace('./', '')),
        path.resolve(contractsDir, importPath.replace('utils/', '')),
    ];

    for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
            console.log(filePath)
            return { contents: fs.readFileSync(filePath, 'utf8') };
        }
    }

    return { error: `File not found: ${importPath}` };
}

function compileContract(contractPath) {
    const contractContent = fs.readFileSync(contractPath, 'utf8');
    const contractName = path.basename(contractPath, '.sol');

    const input = {
        language: "Solidity",
        sources: {
            [contractName]: {
                content: contractContent
            }
        },
        settings: {
            viaIR: true,
            optimizer: {
                enabled: true,
                runs: 200,
            },
            outputSelection: {
                "*": {
                    "*": ["abi", "evm.bytecode", "evm.deployedBytecode", "evm.methodIdentifiers", "metadata"],
                    "": ["ast"]
                }
            }
        }
    };

    console.log("Compiling with solc version:", solc.version());
    const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

    if (output.errors) {
        output.errors.forEach(error => console.error(error.formattedMessage));
        if (output.errors.some(error => error.severity === "error")) {
            throw new Error("Compilation failed");
        }
    }

    const contract = output.contracts[contractName][contractName];
    return {
        abi: contract.abi,
        bytecode: contract.evm.bytecode.object
    };
}

async function deployContract(abi, bytecode) {
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const contract = await factory.deploy({
        maxPriorityFeePerGas: ethers.utils.parseUnits("100", "gwei"),
        maxFeePerGas: ethers.utils.parseUnits("100", "gwei"),
        gasLimit: 10000000
    });

    await contract.deployed();
    return contract;
}

async function main() {
    const contractPath = process.argv[2];
    if (!contractPath) {
        console.error("Please provide the path to the Solidity file.");
        process.exit(1);
    }

    console.log("Compiling contract...");
    const { abi, bytecode } = compileContract(contractPath);

    console.log("Deploying contract...");
    const contract = await deployContract(abi, bytecode);

    console.log(`Contract deployed at address: ${contract.address}`);
    console.log(`Transaction hash: ${contract.deployTransaction.hash}`);
}

main().catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
});