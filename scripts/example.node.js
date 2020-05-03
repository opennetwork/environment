import promise from "./example.js"

promise
  .then(() => {
    console.log("complete. bye")
    process.exit(0)
  })
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
