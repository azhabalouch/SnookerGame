function handlePocketCollision(event) {
    const pairs = event.pairs;

    pairs.forEach(pair => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        // Check if a ball collides with a pocket
        if ((bodyA.label === 'pocket' && bodyB.label.endsWith('Ball')) ||
            (bodyB.label === 'pocket' && bodyA.label.endsWith('Ball'))) {
            
            const ball = bodyA.label.endsWith('Ball') ? bodyA : bodyB;
            
            //Test
            console.log(`${ball.label} potted in pocket!`);

            // Remove the ball from the simulation
            Matter.World.remove(world, ball);

            balls = balls.filter(b => b.body !== ball);

            // Additional logic (e.g., update score, respawn colored balls)
        }
    });
}