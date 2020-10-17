import { useState } from 'react';

export default function useForm(defaults) {
  const [values, setValues] = useState(defaults);

  function updateValue(e) {
    setValues({
      ...values,
      [e.target.name]: e.target.value,
    });
  }

  return { values, updateValue };
}
