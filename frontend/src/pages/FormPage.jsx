import Form from '../components/Form'

const FormPage = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Submit Lead</h1>
        <p className="mt-2 text-sm text-gray-600">
          Fill out the form below to submit a new lead. All fields are required.
        </p>
      </div>

      <div className="card">
        <Form />
      </div>
    </div>
  );
};

export default FormPage;