import { dispatchEvent, addEventListener } from "../environment/environment";

addEventListener("test", async () => {

    let called: number = 0;

    const type = `once.test.${Math.random()}`

    addEventListener(type, () => {
        called += 1;
    }, { once: true });

    await dispatchEvent({
        type
    });

    ok(called === 1);

    await dispatchEvent({
        type
    });

    ok(called === 1);

    await dispatchEvent({
        type
    });

    ok(called === 1);

    const multiType = `multi.test.${Math.random()}`

    let multiCalled = 0;

    addEventListener(multiType, () => {
        multiCalled += 1;
    });

    await dispatchEvent({ type: multiType });
    await dispatchEvent({ type: multiType });

    ok(multiCalled === 2);

    function ok(value: unknown, message?: string): asserts value {
        if (!value) throw new Error(message);
    }

});