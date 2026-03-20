const FormCard = ({ title, description, children }) => {
  return (
    <div className="w-full max-w-xl mx-auto glass-card p-6 md:p-10">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-muted text-sm md:text-base">{description}</p>
        )}
      </div>
      <div>
        {children}
      </div>
    </div>
  );
};

export default FormCard;
