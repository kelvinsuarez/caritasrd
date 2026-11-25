
export function calculateServicePrice(service, quantity) {
  const count = Number(quantity);

  if (!Number.isInteger(count) || count < 1) {
    return 0;
  }

  if (
    service === "Pintacaritas" ||
    service === "Stand de glitter para adultos"
  ) {
    const additionalBlocks = Math.ceil(
      Math.max(0, count - 30) / 10
    );

    return 8500 + additionalBlocks * 1000;
  }

  if (service === "Hair Party") {
    const blocks = Math.ceil(count / 5);

    return Math.max(4500, blocks * 1500);
  }

  return 0;
}

export function calculateTransportPrice(
  locationType,
  coverageStatus
) {
  if (locationType === "interior") {
    return 3000;
  }

  if (locationType === "santo_domingo") {
    if (coverageStatus === "inside") return 0;
    if (coverageStatus === "outside") return 1500;
  }

  return null;
}

export function calculateAdditionalHoursPrice(duration) {
  const hours = Number(duration);

  if (!Number.isInteger(hours) || hours < 2 || hours > 5) {
    return 0;
  }

  return (hours - 2) * 2000;
}
