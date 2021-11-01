import promise from "./example.js"

promise
  .promise
  .then(result => {
    if (result) {
      console.log({ result })
    }
    console.log("complete. bye")
    if (typeof process !== "undefined") {
      process.exit(0)
    }
  })
  .catch(error => {
    console.error(error)
    if (typeof process !== "undefined") {
      process.exit(1)
    }
  })
