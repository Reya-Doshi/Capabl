export default function FeatureCard({
  title,
  desc,
  icon,
}) {

  return (

    <div className="bg-white border border-gray-200 rounded-[32px] p-8 shadow-sm hover:-translate-y-1 transition duration-300">

      <div className="w-14 h-14 rounded-2xl bg-[#f3ede2] flex items-center justify-center mb-6 text-[#b89968]">

        {icon}

      </div>

      <h3 className="text-2xl font-bold mb-4">
        {title}
      </h3>

      <p className="text-gray-500 text-sm leading-relaxed">

        {desc}

      </p>

    </div>
  );
}