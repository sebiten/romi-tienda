export type ShippingQuote = {
  cp: string;
  province: string;
  cost: number;
};

export function calculateShippingFromPostalCode(rawCp: string): ShippingQuote {
  const cp = rawCp.toString().trim().replace(/\D/g, "");

  if (!cp) {
    throw new Error("Falta el código postal.");
  }

  if (cp.length < 3) {
    throw new Error("Código postal inválido.");
  }

  const cpNum = Number(cp);
  let cost = 0;
  let province = "Desconocido";

  if (cpNum >= 4400 && cpNum <= 4499) {
    province = "Salta Capital";
    cost = 0;
  } else if (cpNum >= 4100 && cpNum <= 4399) {
    province = "Salta Interior";
    cost = 2500;
  } else if (cpNum >= 4600 && cpNum <= 4699) {
    province = "Jujuy";
    cost = 3000;
  } else if (cpNum >= 4000 && cpNum <= 4099) {
    province = "Tucumán";
    cost = 3000;
  } else if (cpNum >= 4200 && cpNum <= 4299) {
    province = "Santiago del Estero";
    cost = 3000;
  } else if (cpNum >= 4700 && cpNum <= 4999) {
    province = "Catamarca";
    cost = 3000;
  } else if (cpNum >= 5300 && cpNum <= 5399) {
    province = "La Rioja";
    cost = 3000;
  } else if (cpNum >= 3500 && cpNum <= 3899) {
    province = "Chaco";
    cost = 4200;
  } else if (cpNum >= 3600 && cpNum <= 3699) {
    province = "Formosa";
    cost = 4200;
  } else if (cpNum >= 3400 && cpNum <= 3499) {
    province = "Corrientes";
    cost = 4200;
  } else if (cpNum >= 3300 && cpNum <= 3399) {
    province = "Misiones";
    cost = 4200;
  } else if (cpNum >= 2000 && cpNum <= 2999) {
    province = "Santa Fe";
    cost = 3500;
  } else if (cpNum >= 5000 && cpNum <= 5999) {
    province = "Córdoba";
    cost = 3500;
  } else if (cpNum >= 3100 && cpNum <= 3299) {
    province = "Entre Ríos";
    cost = 3500;
  } else if (cpNum >= 5500 && cpNum <= 5599) {
    province = "Mendoza";
    cost = 4500;
  } else if (cpNum >= 5400 && cpNum <= 5499) {
    province = "San Juan";
    cost = 4500;
  } else if (cpNum >= 5700 && cpNum <= 5799) {
    province = "San Luis";
    cost = 4500;
  } else if (cpNum >= 1000 && cpNum <= 1499) {
    province = "CABA";
    cost = 4000;
  } else if (
    (cpNum >= 1600 && cpNum <= 1899) ||
    (cpNum >= 1900 && cpNum <= 1999) ||
    (cpNum >= 6000 && cpNum <= 7999)
  ) {
    province = "Provincia de Buenos Aires";
    cost = 4500;
  } else if (cpNum >= 8300 && cpNum <= 8399) {
    province = "Neuquén";
    cost = 6000;
  } else if (cpNum >= 8500 && cpNum <= 8599) {
    province = "Río Negro";
    cost = 6000;
  } else if (cpNum >= 9000 && cpNum <= 9499) {
    province = "Chubut / Santa Cruz / TDF";
    cost = 6000;
  } else {
    cost = 5000;
  }

  return { cp, province, cost };
}
