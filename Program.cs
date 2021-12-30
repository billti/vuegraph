using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

var npmOptions = new FileServerOptions();
npmOptions.FileProvider = new PhysicalFileProvider(Path.Combine(app.Environment.ContentRootPath, "node_modules"));
npmOptions.RequestPath = "/node_modules";
app.UseFileServer(npmOptions);

app.UseAuthorization();

app.MapRazorPages();
app.MapControllers();

app.Run();
