import {addEventListener, dispatchEvent, getEnvironmentContext} from "../environment/environment";
import {createFlag, resetFlag} from "../flags/config";
import {hasFlag, removeFlag, setFlag} from "../flags/flags";

addEventListener("configure", async function configure(event) {
  createFlag("FLAG")

  console.log({
    FLAG_create: hasFlag("FLAG")
  })

  setFlag("FLAG")

  console.log({
    FLAG_set: hasFlag("FLAG")
  })

  addEventListener("child event", () => {
    console.log({
      FLAG_child: hasFlag("FLAG")
    })
  })

  await dispatchEvent({ type: "child event" })

  resetFlag("FLAG")
  console.log({
    FLAG_reset: hasFlag("FLAG")
  })

  createFlag("FLAG")
  console.log({
    FLAG_created: hasFlag("FLAG")
  })

  removeFlag("FLAG");
  console.log({
    FLAG_removed: hasFlag("FLAG")
  });

  setFlag("FLAG")
  console.log({
    FLAG_set: hasFlag("FLAG")
  });

  const context = getEnvironmentContext()
  if (context) {
    context["identity"] = {
      _id: "1"
    }
  }
})

addEventListener("execute", async function handler() {
  console.log({
    FLAG: hasFlag("FLAG")
  })
})
